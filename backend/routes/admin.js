
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { createNotification, notifyAdmins } = require('../utils/notificationHelper');

// Admin authentication middleware (requires 'admin' role)
const adminAuth = [authMiddleware, requireRole('admin')];

router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const roleFilter = req.query.role || ''; // 'coach' | 'youth' | 'admin' | 'parent' | '' for all

    let roleCondition = '';
    const params = [];
    if (roleFilter && ['coach', 'youth', 'admin', 'parent'].includes(roleFilter)) {
      roleCondition = ' AND r.name = ?';
      params.push(roleFilter);
    }

    const countQuery = `
      SELECT COUNT(*) as total FROM users u
      LEFT JOIN roles r ON u.primary_role_id = r.id
      WHERE u.status = 'active' ${roleCondition}
    `;
    const [countRows] = await db.execute(countQuery, params);
    const total = countRows[0].total;

    const listQuery = `
      SELECT u.id, u.email, u.status, u.created_at, u.last_login_at,
             r.name as role,
             up.first_name, up.last_name, up.date_of_birth
      FROM users u
      LEFT JOIN roles r ON u.primary_role_id = r.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.status = 'active' ${roleCondition}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.execute(listQuery, [...params, limit, offset]);

    res.json({
      users: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


router.get('/system/health', adminAuth, async (req, res) => {
  try {
    const start = Date.now();
    await db.execute('SELECT 1');
    const latencyMs = Date.now() - start;
    res.json({
      status: 'ok',
      database: 'MySQL',
      connected: true,
      latencyMs
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'MySQL',
      connected: false,
      message: err.message
    });
  }
});

router.get('/system/logs', adminAuth, async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit) || 50);

    // Pull recent activity from real tables and union into a single timeline
    const [rows] = await db.execute(`
      SELECT * FROM (

        -- User registrations
        SELECT
          u.id AS ref_id,
          'registration' AS event_type,
          CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS actor,
          u.email,
          COALESCE(r.name, 'user') AS role,
          'New user registered' AS description,
          u.created_at AS event_time
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN roles r ON u.primary_role_id = r.id

        UNION ALL

        -- Workout completions
        SELECT
          wl.id,
          'workout',
          CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS actor,
          u.email,
          COALESCE(r.name, 'user'),
          CONCAT('Completed workout', IF(wl.duration_min IS NOT NULL, CONCAT(' (', wl.duration_min, ' min)'), '')) AS description,
          wl.performed_at
        FROM user_workout_logs wl
        JOIN users u ON wl.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN roles r ON u.primary_role_id = r.id

        UNION ALL

        -- Badge awards
        SELECT
          ub.id,
          'badge',
          CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS actor,
          u.email,
          COALESCE(r.name, 'user'),
          CONCAT('Earned badge: ', bd.name) AS description,
          ub.earned_at
        FROM user_badges ub
        JOIN users u ON ub.user_id = u.id
        JOIN badge_definitions bd ON ub.badge_id = bd.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN roles r ON u.primary_role_id = r.id

        UNION ALL

        -- Wellness logs
        SELECT
          dwl.id,
          'wellness',
          CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS actor,
          u.email,
          COALESCE(r.name, 'user'),
          CONCAT('Logged wellness data for ', dwl.log_date) AS description,
          dwl.created_at
        FROM daily_wellness_logs dwl
        JOIN users u ON dwl.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN roles r ON u.primary_role_id = r.id

        UNION ALL

        -- Coach assignments
        SELECT
          ca.id,
          'assignment',
          CONCAT(COALESCE(cup.first_name, ''), ' ', COALESCE(cup.last_name, '')) AS actor,
          cu.email,
          'coach',
          CONCAT('Assigned to user: ', COALESCE(uup.first_name, ''), ' ', COALESCE(uup.last_name, '')) AS description,
          ca.assigned_at
        FROM coach_assignments ca
        JOIN users cu ON ca.coach_id = cu.id
        LEFT JOIN user_profiles cup ON cu.id = cup.user_id
        JOIN users uu ON ca.user_id = uu.id
        LEFT JOIN user_profiles uup ON uu.id = uup.user_id

      ) AS combined
      ORDER BY event_time DESC
      LIMIT ?
    `, [limit]);

    res.json({ logs: rows });
  } catch (err) {
    console.error('System logs error:', err);
    res.status(500).json({ error: 'Failed to fetch system logs', message: err.message });
  }
});

router.post('/create-coach', adminAuth, async (req, res) => {
  const bcrypt = require('bcrypt');
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'First name, email and password are required' });
    }

    // Check email not already taken
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Get or create coach role
    let [roleRows] = await db.execute("SELECT id FROM roles WHERE name = 'coach'");
    let roleId;
    if (roleRows.length === 0) {
      const [ins] = await db.execute("INSERT INTO roles (name, description) VALUES ('coach', 'Coach role')");
      roleId = ins.insertId;
    } else {
      roleId = roleRows[0].id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.execute(
      "INSERT INTO users (email, password_hash, status, primary_role_id) VALUES (?, ?, 'active', ?)",
      [email, hashedPassword, roleId]
    );
    const userId = userResult.insertId;

    await db.execute(
      "INSERT INTO user_profiles (user_id, first_name, last_name, timezone) VALUES (?, ?, ?, 'UTC')",
      [userId, firstName, lastName || '']
    );

    await db.execute("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roleId]);

    res.json({ message: 'Coach account created successfully', userId });
  } catch (err) {
    console.error('Create coach error:', err);
    res.status(500).json({ error: 'Failed to create coach account' });
  }
});

router.get('/analytics/summary', adminAuth, async (req, res) => {
  try {
    const [byRole] = await db.execute(
      `SELECT r.name as role, COUNT(u.id) as count
       FROM users u
       LEFT JOIN roles r ON u.primary_role_id = r.id
       WHERE u.status = 'active'
       GROUP BY r.name`
    );
    const [totalWorkouts] = await db.execute(
      `SELECT COUNT(*) as total FROM user_workout_logs`
    );
    const [totalWellness] = await db.execute(
      `SELECT COUNT(DISTINCT user_id) as active FROM daily_wellness_logs WHERE log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    res.json({
      usersByRole: byRole,
      totalWorkoutLogs: totalWorkouts[0]?.total ?? 0,
      activeWellnessUsersLast7Days: totalWellness[0]?.active ?? 0
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
// COACH APPLICATIONS — self-registered coaches pending admin approval
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/coach-applications
 * List all coach accounts with status = 'pending_approval'
 */
router.get('/coach-applications', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.email, u.created_at, u.status,
              up.first_name, up.last_name, up.date_of_birth
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN roles r ON u.primary_role_id = r.id
       WHERE u.status = 'pending_approval' AND r.name = 'coach'
       ORDER BY u.created_at DESC`
    );
    res.json({ applications: rows });
  } catch (err) {
    console.error('Coach applications error:', err);
    res.status(500).json({ error: 'Failed to fetch coach applications' });
  }
});

/**
 * POST /api/admin/coach-applications/:id/approve
 * Approve a coach application — sets status to 'active'
 */
router.post('/coach-applications/:id/approve', adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const [result] = await db.execute(
      `UPDATE users SET status = 'active' WHERE id = ? AND status = 'pending_approval'`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found or already processed' });
    }

    // Ensure user_roles entry exists
    const [roleRows] = await db.execute("SELECT id FROM roles WHERE name = 'coach'");
    if (roleRows.length > 0) {
      await db.execute(
        `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [userId, roleRows[0].id]
      );
    }

    // Notify the coach their application was approved
    await createNotification(
      userId,
      'coach_approved',
      '✅ Application Approved!',
      'Congratulations! Your coach application has been approved. You can now log in and start coaching athletes.',
      '/dashboard'
    );

    res.json({ message: 'Coach application approved. Account is now active.' });
  } catch (err) {
    console.error('Approve coach error:', err);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

/**
 * POST /api/admin/coach-applications/:id/reject
 * Reject a coach application — sets status to 'rejected'
 */
router.post('/coach-applications/:id/reject', adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { reason } = req.body;

    const [result] = await db.execute(
      `UPDATE users SET status = 'rejected' WHERE id = ? AND status = 'pending_approval'`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found or already processed' });
    }

    // Notify the coach their application was rejected
    await createNotification(
      userId,
      'coach_rejected',
      '❌ Application Not Approved',
      'Unfortunately your coach application was not approved at this time. Please contact the admin for more information.',
      null
    );

    res.json({ message: 'Coach application rejected.' });
  } catch (err) {
    console.error('Reject coach error:', err);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

module.exports = router;
