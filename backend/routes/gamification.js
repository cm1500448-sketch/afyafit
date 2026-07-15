const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/badges', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ub.id, ub.earned_at, bd.code, bd.name, bd.description, bd.icon_url
       FROM user_badges ub
       JOIN badge_definitions bd ON ub.badge_id = bd.id
       WHERE ub.user_id = ? AND bd.is_active = 1
       ORDER BY ub.earned_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

router.get('/points', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT COALESCE(SUM(points_delta), 0) as total FROM point_transactions WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ total: rows[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});

router.get('/points-history', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT points_delta, reason, reference_type, reference_id, created_at
       FROM point_transactions WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch points history' });
  }
});

router.get('/all-badges', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, code, name, description, icon_url, points_reward
       FROM badge_definitions WHERE is_active = 1 ORDER BY points_reward ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

module.exports = router;
