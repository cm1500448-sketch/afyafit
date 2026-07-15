const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { notifyAdmins } = require('../utils/notificationHelper');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reason, goals, preferred_style, special_requirements } = req.body;
    const userId = req.user.id;

    if (!reason || !goals)
      return res.status(400).json({ error: 'Reason and goals are required' });
    if (reason.trim().length < 10)
      return res.status(400).json({ error: 'Reason must be at least 10 characters' });
    if (goals.trim().length < 10)
      return res.status(400).json({ error: 'Goals must be at least 10 characters' });

    const [existingRequest] = await db.execute(
      "SELECT id FROM coach_requests WHERE user_id = ? AND status = 'pending'",
      [userId]
    );
    if (existingRequest.length > 0)
      return res.status(400).json({ error: 'You already have a pending coach request' });

    const [existingAssignment] = await db.execute(
      'SELECT id FROM coach_assignments WHERE user_id = ?',
      [userId]
    );
    if (existingAssignment.length > 0)
      return res.status(400).json({ error: 'You already have an assigned coach' });

    const [result] = await db.execute(
      `INSERT INTO coach_requests (user_id, reason, goals, preferred_style, special_requirements, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, reason, goals, preferred_style || null, special_requirements || null]
    );

    const [createdRequest] = await db.execute('SELECT * FROM coach_requests WHERE id = ?', [result.insertId]);

    const [userProfile] = await db.execute(
      `SELECT COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as name
       FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?`,
      [userId]
    );
    await notifyAdmins(
      'coach_request', 'New Coach Request',
      `${userProfile[0]?.name || 'A user'} has requested a coach. Please review and assign one.`,
      '/dashboard'
    );

    res.status(201).json({ message: 'Coach request submitted successfully', request: createdRequest[0] });
  } catch (error) {
    console.error('Error creating coach request:', error);
    res.status(500).json({ error: 'Failed to submit coach request' });
  }
});

router.get('/my-request', authMiddleware, async (req, res) => {
  try {
    const [request] = await db.execute(
      `SELECT cr.*, ca.coach_id,
              COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as coach_name
       FROM coach_requests cr
       LEFT JOIN coach_assignments ca ON cr.user_id = ca.user_id
       LEFT JOIN users u ON ca.coach_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE cr.user_id = ? ORDER BY cr.created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (request.length === 0) return res.status(404).json({ error: 'No coach request found' });
    res.json({ request: request[0] });
  } catch (error) {
    console.error('Error fetching coach request:', error);
    res.status(500).json({ error: 'Failed to fetch coach request' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [request] = await db.execute('SELECT * FROM coach_requests WHERE id = ?', [req.params.id]);

    if (request.length === 0) return res.status(404).json({ error: 'Coach request not found' });
    if (request[0].user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized to cancel this request' });
    if (request[0].status !== 'pending') return res.status(400).json({ error: 'Can only cancel pending requests' });

    await db.execute('DELETE FROM coach_requests WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error canceling coach request:', error);
    res.status(500).json({ error: 'Failed to cancel coach request' });
  }
});

module.exports = router;
