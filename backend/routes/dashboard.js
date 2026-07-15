const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { getHealthTargets } = require('../utils/healthTargets');

router.get('/stats', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  const offset = now.getTimezoneOffset() * 60000;
  const today = new Date(now - offset).toISOString().split('T')[0];

  try {
    const [userRows] = await db.execute(
      `SELECT up.first_name, up.last_name, up.height_cm, up.weight_kg, up.goal_weight_kg, up.date_of_birth
       FROM user_profiles up WHERE up.user_id = ?`,
      [userId]
    );

    const user = userRows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const currentWeight = user.weight_kg || 0;

    const [wellnessRows] = await db.execute(
      `SELECT water_ml, sleep_hours, mood_score, steps
       FROM daily_wellness_logs WHERE user_id = ? AND log_date = ?`,
      [userId, today]
    );
    const wellness = wellnessRows[0] || { water_ml: 0, sleep_hours: 0, mood_score: 0, steps: 0 };
    const waterCups = Math.floor((wellness.water_ml || 0) / 250);

    let consumed = 0;
    try {
      const [mealRows] = await db.execute(
        `SELECT SUM(calories_kcal) as total_cals FROM user_meals WHERE user_id = ? AND meal_date = ?`,
        [userId, today]
      );
      consumed = mealRows[0]?.total_cals || 0;
    } catch (e) {}

    const [weeklyLogs] = await db.execute(
      `SELECT DISTINCT DATE_FORMAT(log_date, '%Y-%m-%d') as log_date
       FROM daily_wellness_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );

    const goalWeight = user.goal_weight_kg || currentWeight;
    const targets = getHealthTargets(user.date_of_birth, currentWeight, goalWeight);

    let bmi = null;
    let bmiCategory = null;
    if (currentWeight > 0 && user.height_cm > 0) {
      const heightM = user.height_cm / 100;
      bmi = parseFloat((currentWeight / (heightM * heightM)).toFixed(1));
      if (bmi < 18.5)    bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal weight';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else               bmiCategory = 'Obese';
    }

    res.json({
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
      weight: currentWeight,
      height: user.height_cm,
      goalWeight,
      steps: wellness.steps || 0,
      waterIntake: waterCups,
      sleep: wellness.sleep_hours || 0,
      mood_score: wellness.mood_score || 2,
      caloriesConsumed: consumed,
      consistency: weeklyLogs.map(log => log.log_date),
      sleepGoal: targets.sleepGoal,
      sleepMin: targets.sleepMin,
      sleepMax: targets.sleepMax,
      waterGoal: targets.waterGoal,
      stepsGoal: targets.stepsGoal,
      calorieTarget: targets.calorieTarget,
      ageGroup: targets.ageGroup,
      age: targets.age,
      bmi,
      bmiCategory
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

router.post('/update-steps', authMiddleware, async (req, res) => {
  const { steps } = req.body;
  const userId = req.user.id;
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const today = new Date(now - offset).toISOString().split('T')[0];

  try {
    await db.execute(
      `INSERT INTO daily_wellness_logs (user_id, log_date, steps)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE steps = ?`,
      [userId, today, steps, steps]
    );
    res.json({ message: 'Steps updated', steps });
  } catch (err) {
    console.error('Update steps error:', err.message);
    res.status(500).json({ error: 'Failed to update steps' });
  }
});

module.exports = router;
