const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, type, title, message, action_url, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ count: rows[0]?.count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get count' });
  }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
