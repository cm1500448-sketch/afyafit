
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [reminders] = await db.execute(
      `SELECT * FROM reminders 
       WHERE user_id = ? AND is_active = TRUE
       ORDER BY scheduled_time ASC`,
      [req.user.id]
    );
    res.json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reminder_type, title, message, scheduled_time } = req.body;

    if (!reminder_type || !title) {
      return res.status(400).json({ error: 'reminder_type and title are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO reminders (user_id, reminder_type, title, message, scheduled_time)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, reminder_type, title, message || null, scheduled_time || null]
    );

    res.json({ id: result.insertId, message: 'Reminder created successfully' });
  } catch (err) {
    console.error('Error creating reminder:', err);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, scheduled_time, is_active } = req.body;

    // Verify reminder belongs to user
    const [reminder] = await db.execute(
      `SELECT * FROM reminders WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (reminder.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    await db.execute(
      `UPDATE reminders 
       SET title = COALESCE(?, title),
           message = COALESCE(?, message),
           scheduled_time = COALESCE(?, scheduled_time),
           is_active = COALESCE(?, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title, message, scheduled_time, is_active, id, req.user.id]
    );

    res.json({ message: 'Reminder updated successfully' });
  } catch (err) {
    console.error('Error updating reminder:', err);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      `DELETE FROM reminders WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    res.json({ message: 'Reminder deleted successfully' });
  } catch (err) {
    console.error('Error deleting reminder:', err);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

router.get('/check-exercise', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Check if user has completed any workout today
    const [todayWorkouts] = await db.execute(
      `SELECT COUNT(*) as count FROM user_workout_logs 
       WHERE user_id = ? AND DATE(performed_at) = ?`,
      [userId, today]
    );

    const hasWorkedOutToday = todayWorkouts[0].count > 0;

    // Get last workout date
    const [lastWorkout] = await db.execute(
      `SELECT MAX(DATE(performed_at)) as last_date 
       FROM user_workout_logs 
       WHERE user_id = ?`,
      [userId]
    );

    const lastWorkoutDate = lastWorkout[0]?.last_date;

    // Check if reminder was already sent today
    const [reminderSent] = await db.execute(
      `SELECT COUNT(*) as count FROM exercise_reminder_logs 
       WHERE user_id = ? AND DATE(sent_at) = ?`,
      [userId, today]
    );

    const reminderAlreadySent = reminderSent[0].count > 0;

    res.json({
      needs_reminder: !hasWorkedOutToday && !reminderAlreadySent,
      has_worked_out_today: hasWorkedOutToday,
      last_workout_date: lastWorkoutDate,
      reminder_sent_today: reminderAlreadySent
    });
  } catch (err) {
    console.error('Error checking exercise reminder:', err);
    res.status(500).json({ error: 'Failed to check exercise reminder' });
  }
});

router.post('/mark-sent', authMiddleware, async (req, res) => {
  try {
    const { reminder_id } = req.body;

    await db.execute(
      `INSERT INTO exercise_reminder_logs (user_id, reminder_id)
       VALUES (?, ?)`,
      [req.user.id, reminder_id || null]
    );

    if (reminder_id) {
      await db.execute(
        `UPDATE reminders SET last_triggered_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [reminder_id]
      );
    }

    res.json({ message: 'Reminder marked as sent' });
  } catch (err) {
    console.error('Error marking reminder:', err);
    res.status(500).json({ error: 'Failed to mark reminder' });
  }
});

module.exports = router;
