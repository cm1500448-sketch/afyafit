const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.log_date, d.sleep_hours, FLOOR(d.water_ml / 250) as water_count,
              d.mood_score, COALESCE(SUM(m.calories_kcal), 0) AS total_daily_calories
       FROM daily_wellness_logs d
       LEFT JOIN user_meals m ON d.user_id = m.user_id AND d.log_date = m.meal_date
       WHERE d.user_id = ? AND d.log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY d.log_date ORDER BY d.log_date ASC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weekly analytics' });
  }
});

router.get('/monthly', authMiddleware, async (req, res) => {
  try {
    const [stats] = await db.execute(
      `SELECT COUNT(DISTINCT DATE(performed_at)) as active_days,
              COUNT(*) as total_workouts,
              COALESCE(SUM(duration_min), 0) as total_minutes
       FROM user_workout_logs
       WHERE user_id = ? AND performed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [req.user.id]
    );
    res.json(stats[0] || { active_days: 0, total_workouts: 0, total_minutes: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly analytics' });
  }
});

module.exports = router;
