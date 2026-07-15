const db = require('../db');

async function awardPoints(userId, points, reason, referenceType = null, referenceId = null) {
  try {
    await db.execute(
      'INSERT INTO point_transactions (user_id, points_delta, reason, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)',
      [userId, points, reason, referenceType, referenceId]
    );
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

async function awardBadge(userId, badgeCode) {
  try {
    const [badges] = await db.execute(
      'SELECT id, points_reward FROM badge_definitions WHERE code = ? AND is_active = 1',
      [badgeCode]
    );
    if (badges.length === 0) return;

    const badge = badges[0];

    const [existing] = await db.execute(
      'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badge.id]
    );
    if (existing.length > 0) return;

    await db.execute('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
    await awardPoints(userId, badge.points_reward, `Earned badge: ${badgeCode}`, 'badge', badge.id);
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
}

async function updateStreak(userId, streakType) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [streaks] = await db.execute(
      `SELECT id, length_days, start_date, end_date FROM user_streaks
       WHERE user_id = ? AND streak_type = ? AND is_active = 1
       ORDER BY start_date DESC LIMIT 1`,
      [userId, streakType]
    );

    if (streaks.length === 0) {
      await db.execute(
        'INSERT INTO user_streaks (user_id, streak_type, length_days, start_date, is_active) VALUES (?, ?, 1, ?, 1)',
        [userId, streakType, today]
      );
      return;
    }

    const streak = streaks[0];
    const daysDiff = Math.floor(
      (new Date(today) - new Date(streak.end_date || streak.start_date)) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) return;

    if (daysDiff === 1) {
      const newLength = streak.length_days + 1;
      await db.execute(
        'UPDATE user_streaks SET length_days = ?, end_date = ?, updated_at = NOW() WHERE id = ?',
        [newLength, today, streak.id]
      );
      if (newLength === 7) await awardBadge(userId, 'STREAK_7');
      if (newLength === 30) await awardBadge(userId, 'STREAK_30');
    } else {
      await db.execute('UPDATE user_streaks SET is_active = 0 WHERE id = ?', [streak.id]);
      await db.execute(
        'INSERT INTO user_streaks (user_id, streak_type, length_days, start_date, is_active) VALUES (?, ?, 1, ?, 1)',
        [userId, streakType, today]
      );
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

async function checkWorkoutAchievements(userId) {
  try {
    const [workouts] = await db.execute(
      'SELECT COUNT(*) as total FROM user_workout_logs WHERE user_id = ?',
      [userId]
    );
    const total = workouts[0].total;
    if (total >= 1)  await awardBadge(userId, 'FIRST_WORKOUT');
    if (total >= 50) await awardBadge(userId, 'FITNESS_FANATIC');
    await updateStreak(userId, 'workout');
  } catch (error) {
    console.error('Error checking workout achievements:', error);
  }
}

async function checkWellnessAchievements(userId) {
  try {
    await updateStreak(userId, 'wellness');

    const [logs] = await db.execute(
      `SELECT COUNT(DISTINCT log_date) as days FROM daily_wellness_logs
       WHERE user_id = ? AND log_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [userId]
    );
    if (logs[0].days >= 30) await awardBadge(userId, 'WELLNESS_WARRIOR');

    const [water] = await db.execute(
      `SELECT COUNT(DISTINCT log_date) as days FROM daily_wellness_logs
       WHERE user_id = ? AND water_ml >= 2000 AND log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    if (water[0].days >= 7) await awardBadge(userId, 'HYDRATION_HERO');

    const [sleep] = await db.execute(
      `SELECT COUNT(DISTINCT log_date) as days FROM daily_wellness_logs
       WHERE user_id = ? AND sleep_hours >= 8 AND log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    if (sleep[0].days >= 7) await awardBadge(userId, 'SLEEP_CHAMPION');
  } catch (error) {
    console.error('Error checking wellness achievements:', error);
  }
}

function calculateWellnessScore(sleepHours, waterCount, moodScore) {
  const sleepScore = Math.min(sleepHours / 8, 1);
  const waterScore = Math.min(waterCount / 8, 1);
  const moodNorm = moodScore / 10;
  return Math.round(((sleepScore + waterScore + moodNorm) / 3) * 10000) / 100;
}

module.exports = { awardPoints, awardBadge, updateStreak, checkWorkoutAchievements, checkWellnessAchievements, calculateWellnessScore };
