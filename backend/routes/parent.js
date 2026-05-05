
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/youth-list', authMiddleware, async (req, res) => {
  try {
    // Check if user is a parent
    const [roleCheck] = await db.execute(
      `SELECT r.name as role_name FROM users u
       JOIN roles r ON u.primary_role_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (roleCheck[0]?.role_name !== 'parent') {
      return res.status(403).json({ error: 'Access denied. Parent role required.' });
    }

    const [youthList] = await db.execute(
      `SELECT 
        u.id,
        u.email,
        up.first_name,
        up.last_name,
        up.date_of_birth,
        pyr.verification_code,
        pyr.is_verified,
        pyr.created_at as linked_at
       FROM parent_youth_relationships pyr
       JOIN users u ON pyr.youth_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE pyr.parent_id = ? AND pyr.is_verified = TRUE
       ORDER BY pyr.created_at DESC`,
      [req.user.id]
    );

    res.json(youthList);
  } catch (err) {
    console.error('Error fetching youth list:', err);
    res.status(500).json({ error: 'Failed to fetch youth list' });
  }
});

router.post('/link-youth', authMiddleware, async (req, res) => {
  try {
    const { verification_code } = req.body;

    if (!verification_code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    // Check if user is a parent
    const [roleCheck] = await db.execute(
      `SELECT r.name as role_name FROM users u
       JOIN roles r ON u.primary_role_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (roleCheck[0]?.role_name !== 'parent') {
      return res.status(403).json({ error: 'Access denied. Parent role required.' });
    }

    // Find relationship with this verification code
    const [relationship] = await db.execute(
      `SELECT * FROM parent_youth_relationships 
       WHERE verification_code = ? AND parent_id = ?`,
      [verification_code, req.user.id]
    );

    if (relationship.length === 0) {
      return res.status(404).json({ error: 'Invalid verification code' });
    }

    // Verify the relationship
    await db.execute(
      `UPDATE parent_youth_relationships 
       SET is_verified = TRUE 
       WHERE verification_code = ? AND parent_id = ?`,
      [verification_code, req.user.id]
    );

    res.json({ message: 'Youth account linked successfully' });
  } catch (err) {
    console.error('Error linking youth:', err);
    res.status(500).json({ error: 'Failed to link youth account' });
  }
});

router.get('/youth-report/:youthId', authMiddleware, async (req, res) => {
  try {
    const { youthId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify parent has access to this youth
    const [relationship] = await db.execute(
      `SELECT * FROM parent_youth_relationships 
       WHERE parent_id = ? AND youth_id = ? AND is_verified = TRUE`,
      [req.user.id, youthId]
    );

    if (relationship.length === 0) {
      return res.status(403).json({ error: 'Access denied to this youth account' });
    }

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get wellness data
    const [wellnessData] = await db.execute(
      `SELECT 
        log_date,
        water_ml,
        sleep_hours,
        mood_score
       FROM daily_wellness_logs
       WHERE user_id = ? AND log_date BETWEEN ? AND ?
       ORDER BY log_date DESC`,
      [youthId, start, end]
    );

    // Get workout data
    const [workoutData] = await db.execute(
      `SELECT 
        DATE(performed_at) as workout_date,
        COUNT(*) as workout_count,
        SUM(duration_min) as total_minutes
       FROM user_workout_logs
       WHERE user_id = ? AND DATE(performed_at) BETWEEN ? AND ?
       GROUP BY DATE(performed_at)
       ORDER BY workout_date DESC`,
      [youthId, start, end]
    );

    // Get meal data
    const [mealData] = await db.execute(
      `SELECT 
        meal_date,
        SUM(calories_kcal) as total_calories,
        COUNT(*) as meal_count
       FROM user_meals
       WHERE user_id = ? AND meal_date BETWEEN ? AND ?
       GROUP BY meal_date
       ORDER BY meal_date DESC`,
      [youthId, start, end]
    );

    // Get streaks
    const [streaks] = await db.execute(
      `SELECT streak_type, MAX(length_days) as max_streak
       FROM user_streaks
       WHERE user_id = ? AND (end_date IS NULL OR end_date >= CURDATE())
       GROUP BY streak_type`,
      [youthId]
    );

    // Get badges
    const [badges] = await db.execute(
      `SELECT bd.name, bd.description, ub.earned_at
       FROM user_badges ub
       JOIN badge_definitions bd ON ub.badge_id = bd.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [youthId]
    );

    // Get user profile
    const [profile] = await db.execute(
      `SELECT first_name, last_name, height_cm, weight_kg
       FROM user_profiles
       WHERE user_id = ?`,
      [youthId]
    );

    res.json({
      youth: profile[0] || {},
      period: { start, end },
      wellness: wellnessData,
      workouts: workoutData,
      meals: mealData,
      streaks: streaks.reduce((acc, s) => {
        acc[s.streak_type] = s.max_streak || 0;
        return acc;
      }, { wellness: 0, workout: 0 }),
      badges: badges
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.post('/generate-code', authMiddleware, async (req, res) => {
  try {
    const { parentEmail } = req.body;

    if (!parentEmail) {
      return res.status(400).json({ error: 'Parent email is required' });
    }

    // Find parent by email
    const [parent] = await db.execute(
      `SELECT u.id, r.name as role_name 
       FROM users u
       JOIN roles r ON u.primary_role_id = r.id
       WHERE u.email = ? AND r.name = 'parent'`,
      [parentEmail]
    );

    if (parent.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parentId = parent[0].id;
    const youthId = req.user.id;

    // Generate unique verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if relationship already exists
    const [existing] = await db.execute(
      `SELECT * FROM parent_youth_relationships 
       WHERE parent_id = ? AND youth_id = ?`,
      [parentId, youthId]
    );

    if (existing.length > 0) {
      // Update existing relationship
      await db.execute(
        `UPDATE parent_youth_relationships 
         SET verification_code = ?, is_verified = FALSE
         WHERE parent_id = ? AND youth_id = ?`,
        [verificationCode, parentId, youthId]
      );
    } else {
      // Create new relationship
      await db.execute(
        `INSERT INTO parent_youth_relationships (parent_id, youth_id, verification_code, is_verified)
         VALUES (?, ?, ?, FALSE)`,
        [parentId, youthId, verificationCode]
      );
    }

    res.json({ verification_code: verificationCode });
  } catch (err) {
    console.error('Error generating code:', err);
    res.status(500).json({ error: 'Failed to generate verification code' });
  }
});

module.exports = router;
