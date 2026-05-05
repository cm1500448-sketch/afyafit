
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { createNotification } = require('../utils/notificationHelper');

router.get('/coach-requests', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [requests] = await db.execute(
      `SELECT 
        cr.id,
        cr.user_id,
        cr.reason,
        cr.goals,
        cr.preferred_style,
        cr.special_requirements,
        cr.status,
        cr.created_at,
        COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as user_name,
        u.email as user_email,
        up.fitness_level
       FROM coach_requests cr
       JOIN users u ON cr.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE cr.status = 'pending'
       ORDER BY cr.created_at ASC`
    );

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching coach requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch coach requests',
      message: error.message 
    });
  }
});

router.get('/coaches', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [coaches] = await db.execute(
      `SELECT 
        u.id,
        COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as name,
        u.email,
        COUNT(ca.id) as assigned_users_count
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN coach_assignments ca ON u.id = ca.coach_id
       WHERE r.name = 'coach'
       GROUP BY u.id, up.first_name, up.last_name, u.email
       ORDER BY assigned_users_count ASC, up.first_name ASC`
    );

    res.json({ coaches });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ 
      error: 'Failed to fetch coaches',
      message: error.message 
    });
  }
});

router.post('/coach-assignments', authMiddleware, requireRole('admin'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { coachRequestId, coachId } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!coachRequestId || !coachId) {
      return res.status(400).json({ 
        error: 'Coach request ID and coach ID are required' 
      });
    }

    // Start transaction
    await connection.beginTransaction();

    // Get coach request details
    const [request] = await connection.execute(
      `SELECT * FROM coach_requests WHERE id = ? AND status = 'pending'`,
      [coachRequestId]
    );

    if (request.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'Coach request not found or not pending' 
      });
    }

    const userId = request[0].user_id;

    // Check for existing assignment
    const [existingAssignment] = await connection.execute(
      `SELECT id FROM coach_assignments WHERE user_id = ?`,
      [userId]
    );

    if (existingAssignment.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'User already has an assigned coach' 
      });
    }

    // Create coach assignment
    const [assignmentResult] = await connection.execute(
      `INSERT INTO coach_assignments 
       (coach_id, user_id, assigned_by_admin_id)
       VALUES (?, ?, ?)`,
      [coachId, userId, adminId]
    );

    // Update coach request status
    await connection.execute(
      `UPDATE coach_requests SET status = 'assigned' WHERE id = ?`,
      [coachRequestId]
    );

    // Commit transaction
    await connection.commit();

    // Get created assignment with details
    const [assignment] = await db.execute(
      `SELECT 
        ca.*,
        CONCAT(up_user.first_name, ' ', up_user.last_name) as user_name,
        CONCAT(up_coach.first_name, ' ', up_coach.last_name) as coach_name
       FROM coach_assignments ca
       JOIN users u ON ca.user_id = u.id
       JOIN users c ON ca.coach_id = c.id
       LEFT JOIN user_profiles up_user ON u.id = up_user.user_id
       LEFT JOIN user_profiles up_coach ON c.id = up_coach.user_id
       WHERE ca.id = ?`,
      [assignmentResult.insertId]
    );

    // Notify the youth user and the coach about the assignment
    const assignmentData = assignment[0];
    await createNotification(
      userId,
      'coach_assigned',
      '🎉 Coach Assigned!',
      `Great news! A coach has been assigned to support your fitness journey. Check your profile to connect.`,
      '/profile'
    );
    await createNotification(
      coachId,
      'coach_assigned',
      '👤 New Athlete Assigned',
      `A new athlete has been assigned to you. Visit your dashboard to view their profile and start coaching.`,
      '/dashboard'
    );

    res.status(201).json({
      message: 'Coach assigned successfully',
      assignment: assignment[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating coach assignment:', error);
    res.status(500).json({ 
      error: 'Failed to assign coach',
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

router.put('/coach-assignments/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { newCoachId } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!newCoachId) {
      return res.status(400).json({ 
        error: 'New coach ID is required' 
      });
    }

    // Check if assignment exists
    const [assignment] = await db.execute(
      `SELECT * FROM coach_assignments WHERE id = ?`,
      [assignmentId]
    );

    if (assignment.length === 0) {
      return res.status(404).json({ 
        error: 'Coach assignment not found' 
      });
    }

    // Update assignment
    await db.execute(
      `UPDATE coach_assignments 
       SET coach_id = ?, assigned_by_admin_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newCoachId, adminId, assignmentId]
    );

    // Get updated assignment
    const [updatedAssignment] = await db.execute(
      `SELECT 
        ca.*,
        CONCAT(up_user.first_name, ' ', up_user.last_name) as user_name,
        CONCAT(up_coach.first_name, ' ', up_coach.last_name) as coach_name
       FROM coach_assignments ca
       JOIN users u ON ca.user_id = u.id
       JOIN users c ON ca.coach_id = c.id
       LEFT JOIN user_profiles up_user ON u.id = up_user.user_id
       LEFT JOIN user_profiles up_coach ON c.id = up_coach.user_id
       WHERE ca.id = ?`,
      [assignmentId]
    );

    res.json({
      message: 'Coach reassigned successfully',
      assignment: updatedAssignment[0]
    });
  } catch (error) {
    console.error('Error reassigning coach:', error);
    res.status(500).json({ 
      error: 'Failed to reassign coach',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/admin/coach-assignments/:id
 * Remove a coach assignment
 */
router.delete('/coach-assignments/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const assignmentId = req.params.id;

    // Start transaction
    await connection.beginTransaction();

    // Get assignment details
    const [assignment] = await connection.execute(
      `SELECT ca.*, cr.id as request_id
       FROM coach_assignments ca
       LEFT JOIN coach_requests cr ON ca.user_id = cr.user_id AND cr.status = 'assigned'
       WHERE ca.id = ?`,
      [assignmentId]
    );

    if (assignment.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'Coach assignment not found' 
      });
    }

    // Delete assignment
    await connection.execute(
      `DELETE FROM coach_assignments WHERE id = ?`,
      [assignmentId]
    );

    // Update associated coach request status back to pending
    if (assignment[0].request_id) {
      await connection.execute(
        `UPDATE coach_requests SET status = 'pending' WHERE id = ?`,
        [assignment[0].request_id]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Error removing coach assignment:', error);
    res.status(500).json({ 
      error: 'Failed to remove coach assignment',
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/admin/coach-assignments
 * Get all active coach assignments
 */
router.get('/coach-assignments', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [assignments] = await db.execute(
      `SELECT 
        ca.id,
        ca.coach_id,
        ca.user_id,
        ca.assigned_at,
        CONCAT(up_user.first_name, ' ', up_user.last_name) as user_name,
        u.email as user_email,
        CONCAT(up_coach.first_name, ' ', up_coach.last_name) as coach_name,
        c.email as coach_email,
        CONCAT(up_admin.first_name, ' ', up_admin.last_name) as admin_name,
        cr.goals
       FROM coach_assignments ca
       JOIN users u ON ca.user_id = u.id
       JOIN users c ON ca.coach_id = c.id
       JOIN users a ON ca.assigned_by_admin_id = a.id
       LEFT JOIN user_profiles up_user ON u.id = up_user.user_id
       LEFT JOIN user_profiles up_coach ON c.id = up_coach.user_id
       LEFT JOIN user_profiles up_admin ON a.id = up_admin.user_id
       LEFT JOIN coach_requests cr ON ca.user_id = cr.user_id AND cr.status = 'assigned'
       ORDER BY ca.assigned_at DESC`
    );

    res.json({ assignments });
  } catch (error) {
    console.error('Error fetching coach assignments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch coach assignments',
      message: error.message 
    });
  }
});

module.exports = router;
