
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { getCompleteReportData } = require('../services/reportDataService');

/**
 * GET /api/coach/assigned-users
 * Get all users assigned to the authenticated coach
 */
router.get('/assigned-users', authMiddleware, requireRole('coach'), async (req, res) => {
  try {
    const coachId = req.user.id;

    const [users] = await db.execute(
      `SELECT 
        ca.id as assignment_id,
        ca.assigned_at,
        u.id as user_id,
        COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as user_name,
        u.email,
        up.fitness_level,
        cr.goals,
        cr.reason
       FROM coach_assignments ca
       JOIN users u ON ca.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN coach_requests cr ON u.id = cr.user_id AND cr.status = 'assigned'
       WHERE ca.coach_id = ?
       ORDER BY ca.assigned_at DESC`,
      [coachId]
    );

    res.json({ users });
  } catch (error) {
    console.error('Error fetching assigned users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch assigned users',
      message: error.message 
    });
  }
});

/**
 * GET /api/coach/user-data/:userId
 * Get detailed data for an assigned user
 */
router.get('/user-data/:userId', authMiddleware, requireRole('coach'), async (req, res) => {
  try {
    const coachId = req.user.id;
    const userId = parseInt(req.params.userId);

    // Verify coach has access to this user
    const [assignment] = await db.execute(
      `SELECT id FROM coach_assignments 
       WHERE coach_id = ? AND user_id = ?`,
      [coachId, userId]
    );

    if (assignment.length === 0) {
      return res.status(403).json({ 
        error: 'Not authorized to view this user\'s data' 
      });
    }

    // Get user profile and goals
    const [userProfile] = await db.execute(
      `SELECT 
        u.id,
        COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as name,
        u.email,
        up.fitness_level,
        up.height_cm,
        up.weight_kg,
        up.goal_weight_kg,
        cr.goals
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN coach_requests cr ON u.id = cr.user_id AND cr.status = 'assigned'
       WHERE u.id = ?`,
      [userId]
    );

    if (userProfile.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Get last 30 days of data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get complete report data
    const reportData = await getCompleteReportData(userId, startDate, endDate);

    // Get recent wellness logs
    const [recentWellness] = await db.execute(
      `SELECT 
        log_date,
        sleep_hours,
        FLOOR(water_ml / 250) as water_cups,
        mood_score
       FROM daily_wellness_logs
       WHERE user_id = ?
       ORDER BY log_date DESC
       LIMIT 7`,
      [userId]
    );

    // Get recent workouts
    const [recentWorkouts] = await db.execute(
      `SELECT 
        uwl.performed_at,
        uwl.duration_min,
        wl.name as workout_name,
        wl.difficulty
       FROM user_workout_logs uwl
       LEFT JOIN workout_library wl ON uwl.workout_id = wl.id
       WHERE uwl.user_id = ?
       ORDER BY uwl.performed_at DESC
       LIMIT 10`,
      [userId]
    );

    // Calculate weekly and monthly stats
    // Filter out rows where sleep_hours or water_cups are null/undefined before averaging
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWeekWorkouts = recentWorkouts.filter(w => new Date(w.performed_at) >= weekAgo);

    const wellnessWithSleep = recentWellness.filter(
      w => w.sleep_hours !== null && w.sleep_hours !== undefined && !isNaN(parseFloat(w.sleep_hours))
    );
    const wellnessWithWater = recentWellness.filter(
      w => w.water_cups !== null && w.water_cups !== undefined && !isNaN(parseFloat(w.water_cups))
    );

    const avgSleepRaw = wellnessWithSleep.length > 0
      ? wellnessWithSleep.reduce((sum, w) => sum + parseFloat(w.sleep_hours), 0) / wellnessWithSleep.length
      : 0;

    // water_cups is already in cups (FLOOR(water_ml / 250)) — convert to liters for display
    // 1 cup = 0.25L, so cups * 0.25 = liters
    const avgWaterCupsRaw = wellnessWithWater.length > 0
      ? wellnessWithWater.reduce((sum, w) => sum + parseFloat(w.water_cups), 0) / wellnessWithWater.length
      : 0;

    const weeklyStats = {
      workouts: recentWeekWorkouts.length,
      avgSleep: parseFloat(avgSleepRaw.toFixed(1)),       // hours, e.g. 7.5
      avgWaterCups: parseFloat(avgWaterCupsRaw.toFixed(1)), // cups, e.g. 6.0
      avgWaterLiters: parseFloat((avgWaterCupsRaw * 0.25).toFixed(1)) // liters, e.g. 1.5
    };

    const monthlyStats = {
      workouts: recentWorkouts.length,
      completionRate: reportData.fitness?.completionRate || 0,
      points: reportData.points?.totalPoints || 0
    };

    res.json({
      user: userProfile[0],
      wellness: {
        ...reportData.wellness,
        avgCalories: reportData.calories?.avgCalories || 0
      },
      fitness: reportData.fitness,
      progress: reportData.progress,
      achievements: reportData.achievements,
      points: reportData.points,
      weeklyStats,
      monthlyStats,
      recentWellness,
      recentWorkouts
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      message: error.message 
    });
  }
});

module.exports = router;
