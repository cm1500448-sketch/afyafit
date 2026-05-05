
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { getHealthTargets } = require('../utils/healthTargets');

// Coach authentication middleware (requires 'coach' role)
const coachAuth = [authMiddleware, requireRole('coach')];

// Nutrition red flag thresholds (USDA / dietitian guidelines)
const NUTRITION_LOW_PCT = 0.7;  // below 70% of calorie target = under-eating red flag
const NUTRITION_HIGH_PCT = 1.3; // above 130% of calorie target = over-eating red flag

router.get('/athletes', coachAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [athletes] = await db.execute(
      `SELECT u.id, u.email,
              up.first_name, up.last_name, up.weight_kg, up.goal_weight_kg,
              up.date_of_birth,
              r.name as role
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN roles r ON u.primary_role_id = r.id
       WHERE r.name = 'youth' AND u.status = 'active'
       ORDER BY up.first_name, up.last_name`
    );

    const result = [];
    for (const a of athletes) {
      const [wellness] = await db.execute(
        `SELECT water_ml, sleep_hours, mood_score FROM daily_wellness_logs WHERE user_id = ? AND log_date = ?`,
        [a.id, today]
      );
      const [meals] = await db.execute(
        `SELECT COALESCE(SUM(calories_kcal), 0) as total FROM user_meals WHERE user_id = ? AND meal_date = ?`,
        [a.id, today]
      );

      // Check for 3+ consecutive low mood days (mood_score <= 1 = sad/stressed)
      // This is a mental health red flag that coaches should follow up on
      const [moodHistory] = await db.execute(
        `SELECT mood_score FROM daily_wellness_logs
         WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
         ORDER BY log_date DESC
         LIMIT 3`,
        [a.id]
      );
      const consecutiveLowMood = moodHistory.length >= 3 &&
        moodHistory.every(row => row.mood_score !== null && row.mood_score <= 1);
      // Get age-aware health targets for this specific athlete
      const targets = getHealthTargets(a.date_of_birth, a.weight_kg || 0, a.goal_weight_kg || 0);

      const calorieTarget = targets.calorieTarget;
      const consumed = meals[0].total || 0;
      const sleepHours = wellness[0]?.sleep_hours ?? null;
      const sleepPct = sleepHours != null ? Math.min(100, (sleepHours / targets.sleepGoal) * 100) : 0;
      const nutritionPct = calorieTarget > 0 ? Math.min(100, (consumed / calorieTarget) * 100) : 0;

      const redFlags = [];
      if (sleepHours != null && sleepHours < targets.sleepMin) {
        redFlags.push({
          type: 'sleep',
          message: `Sleep ${sleepHours}h — below minimum ${targets.sleepMin}h for age group: ${targets.ageGroup}`
        });
      }
      if (calorieTarget > 0 && consumed < calorieTarget * NUTRITION_LOW_PCT) {
        redFlags.push({
          type: 'calories',
          message: `Calories ${Math.round(consumed)} kcal — below 70% of target ${calorieTarget} kcal`
        });
      }
      // Mental health red flag: 3+ consecutive days of low mood (score <= 1)
      // Mood scale: 0=Very sad, 1=Sad, 2=Neutral, 3=Happy, 4=Very happy
      if (consecutiveLowMood) {
        redFlags.push({
          type: 'mood',
          message: `Low mood reported for 3+ consecutive days — consider checking in with this athlete`
        });
      }

      result.push({
        id: a.id,
        email: a.email,
        first_name: a.first_name,
        last_name: a.last_name,
        fullName: [a.first_name, a.last_name].filter(Boolean).join(' ') || a.email,
        age: targets.age,
        age_group: targets.ageGroup,
        sleep_hours: sleepHours,
        sleep_target: targets.sleepGoal,
        sleep_min: targets.sleepMin,
        sleep_max: targets.sleepMax,
        sleep_progress_pct: Math.round(sleepPct),
        calories_consumed: consumed,
        calorie_target: calorieTarget,
        nutrition_progress_pct: Math.round(nutritionPct),
        water_target_cups: targets.waterGoal,
        steps_target: targets.stepsGoal,
        red_flags: redFlags
      });
    }

    res.json({ athletes: result });
  } catch (err) {
    console.error('Coach athletes error:', err);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
});

module.exports = router;
