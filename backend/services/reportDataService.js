const db = require('../db');

async function getWellnessSummary(userId, startDate, endDate) {
  try {
    const [rows] = await db.execute(
      `SELECT AVG(sleep_hours) as avg_sleep, AVG(water_ml / 250) as avg_water,
              AVG(mood_score) as avg_mood, COUNT(*) as days_logged
       FROM daily_wellness_logs WHERE user_id = ? AND log_date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    const moodLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
    const avgMoodScore = Math.round(rows[0]?.avg_mood ?? 2);
    return {
      avgSleep: parseFloat(rows[0]?.avg_sleep || 0).toFixed(1),
      avgWater: parseFloat(rows[0]?.avg_water || 0).toFixed(1),
      avgCalories: 0,
      mostCommonMood: moodLabels[avgMoodScore] || 'Okay',
      daysLogged: rows[0]?.days_logged || 0
    };
  } catch (error) {
    console.error('Error in getWellnessSummary:', error);
    return { avgSleep: 0, avgWater: 0, avgCalories: 0, mostCommonMood: 'N/A', daysLogged: 0 };
  }
}

async function getCalorieSummary(userId, startDate, endDate) {
  try {
    const [rows] = await db.execute(
      `SELECT AVG(daily_calories) as avg_calories, SUM(daily_calories) as total_calories,
              COUNT(DISTINCT meal_date) as days_logged
       FROM (
         SELECT meal_date, SUM(calories_kcal) as daily_calories
         FROM user_meals WHERE user_id = ? AND meal_date BETWEEN ? AND ?
         GROUP BY meal_date
       ) as daily_totals`,
      [userId, startDate, endDate]
    );
    return {
      avgCalories: parseInt(rows[0]?.avg_calories || 0),
      totalCalories: parseInt(rows[0]?.total_calories || 0),
      daysLogged: rows[0]?.days_logged || 0
    };
  } catch (error) {
    console.error('Error in getCalorieSummary:', error);
    return { avgCalories: 0, totalCalories: 0, daysLogged: 0 };
  }
}

async function getMoodDistribution(userId, startDate, endDate) {
  try {
    const [rows] = await db.execute(
      `SELECT mood_score, COUNT(*) as count FROM daily_wellness_logs
       WHERE user_id = ? AND log_date BETWEEN ? AND ? AND mood_score IS NOT NULL
       GROUP BY mood_score`,
      [userId, startDate, endDate]
    );
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    if (total === 0) return { terrible: 0, bad: 0, good: 0, great: 0 };

    const distribution = { terrible: 0, bad: 0, good: 0, great: 0 };
    const moodLabels = ['terrible', 'bad', 'good', 'great'];
    rows.forEach(row => {
      const label = moodLabels[row.mood_score] || 'good';
      distribution[label] = ((row.count / total) * 100).toFixed(1);
    });
    return distribution;
  } catch (error) {
    console.error('Error in getMoodDistribution:', error);
    return { terrible: 0, bad: 0, good: 0, great: 0 };
  }
}

async function getFitnessSummary(userId, startDate, endDate) {
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as total_workouts, SUM(duration_min) as total_duration, AVG(duration_min) as avg_duration
       FROM user_workout_logs WHERE user_id = ? AND DATE(performed_at) BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    const [workoutTypes] = await db.execute(
      `SELECT DISTINCT wl.name FROM user_workout_logs uwl
       JOIN workout_library wl ON uwl.workout_id = wl.id
       WHERE uwl.user_id = ? AND DATE(uwl.performed_at) BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    return {
      totalWorkouts: rows[0]?.total_workouts || 0,
      totalDuration: parseInt(rows[0]?.total_duration || 0),
      avgDuration: parseFloat(rows[0]?.avg_duration || 0).toFixed(1),
      uniqueWorkouts: workoutTypes.length,
      completionRate: 0
    };
  } catch (error) {
    console.error('Error in getFitnessSummary:', error);
    return { totalWorkouts: 0, totalDuration: 0, avgDuration: 0, uniqueWorkouts: 0 };
  }
}

async function getProgressMetrics(userId, startDate, endDate) {
  try {
    const [userProfile] = await db.execute(
      'SELECT height_cm, fitness_level FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    const height = userProfile[0]?.height_cm || 170;
    const fitnessLevel = userProfile[0]?.fitness_level || 'Beginner';

    const [startWeight] = await db.execute(
      'SELECT weight_kg FROM user_profiles WHERE user_id = ? ORDER BY updated_at ASC LIMIT 1',
      [userId]
    );
    const [endWeight] = await db.execute(
      'SELECT weight_kg FROM user_profiles WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    const sw = startWeight[0]?.weight_kg || 0;
    const ew = endWeight[0]?.weight_kg || 0;
    const heightM = height / 100;
    const startBMI = sw / (heightM * heightM);
    const endBMI = ew / (heightM * heightM);

    return {
      currentWeight: parseFloat(ew).toFixed(1),
      startWeight: parseFloat(sw).toFixed(1),
      weightChange: parseFloat(ew - sw).toFixed(1),
      currentBMI: parseFloat(endBMI).toFixed(1),
      startBMI: parseFloat(startBMI).toFixed(1),
      bmiChange: parseFloat(endBMI - startBMI).toFixed(1),
      fitnessLevel
    };
  } catch (error) {
    console.error('Error in getProgressMetrics:', error);
    return { currentWeight: 0, startWeight: 0, weightChange: 0, currentBMI: 0, startBMI: 0, bmiChange: 0, fitnessLevel: 'Beginner' };
  }
}

async function getAchievements(userId, startDate, endDate) {
  try {
    const [badges] = await db.execute(
      `SELECT bd.name, bd.description, bd.icon_url as icon, ub.earned_at
       FROM user_badges ub JOIN badge_definitions bd ON ub.badge_id = bd.id
       WHERE ub.user_id = ? AND DATE(ub.earned_at) BETWEEN ? AND ?
       ORDER BY ub.earned_at DESC`,
      [userId, startDate, endDate]
    );
    const [totalRows] = await db.execute(
      'SELECT COUNT(*) as total FROM user_badges WHERE user_id = ?',
      [userId]
    );
    return {
      badges: badges.map(b => ({ name: b.name, description: b.description, icon: b.icon, earnedAt: b.earned_at })),
      totalBadges: totalRows[0]?.total || 0
    };
  } catch (error) {
    console.error('Error in getAchievements:', error);
    return { badges: [], totalBadges: 0 };
  }
}

async function getPointsSummary(userId, startDate, endDate) {
  try {
    const [rows] = await db.execute(
      `SELECT SUM(points_delta) as total_points, COUNT(*) as total_activities
       FROM point_transactions WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    const [allTime] = await db.execute(
      'SELECT COALESCE(SUM(points_delta), 0) as total FROM point_transactions WHERE user_id = ?',
      [userId]
    );
    return {
      totalPoints: parseInt(allTime[0]?.total || 0),
      periodPoints: parseInt(rows[0]?.total_points || 0),
      totalActivities: rows[0]?.total_activities || 0
    };
  } catch (error) {
    console.error('Error in getPointsSummary:', error);
    return { totalPoints: 0, periodPoints: 0, totalActivities: 0 };
  }
}

async function getStreaks(userId) {
  try {
    const [rows] = await db.execute(
      'SELECT streak_type, length_days, is_active FROM user_streaks WHERE user_id = ? ORDER BY length_days DESC',
      [userId]
    );
    const streaks = { wellness: { current: 0, longest: 0 }, workout: { current: 0, longest: 0 } };
    rows.forEach(row => {
      const t = row.streak_type;
      if (t === 'wellness' || t === 'workout') {
        if (row.length_days > streaks[t].longest) streaks[t].longest = row.length_days;
        if (row.is_active) streaks[t].current = row.length_days;
      }
    });
    return streaks;
  } catch (error) {
    console.error('Error in getStreaks:', error);
    return { wellness: { current: 0, longest: 0 }, workout: { current: 0, longest: 0 } };
  }
}

async function getCompleteReportData(userId, startDate, endDate) {
  try {
    const [wellness, calories, mood, fitness, progress, achievements, points, streaks] = await Promise.all([
      getWellnessSummary(userId, startDate, endDate),
      getCalorieSummary(userId, startDate, endDate),
      getMoodDistribution(userId, startDate, endDate),
      getFitnessSummary(userId, startDate, endDate),
      getProgressMetrics(userId, startDate, endDate),
      getAchievements(userId, startDate, endDate),
      getPointsSummary(userId, startDate, endDate),
      getStreaks(userId)
    ]);
    return { wellness, calories, mood, fitness, progress, achievements, points, streaks, dateRange: { startDate, endDate } };
  } catch (error) {
    console.error('Error in getCompleteReportData:', error);
    throw error;
  }
}

module.exports = {
  getWellnessSummary, getCalorieSummary, getMoodDistribution, getFitnessSummary,
  getProgressMetrics, getAchievements, getPointsSummary, getStreaks, getCompleteReportData
};
