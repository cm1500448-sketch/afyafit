
const db = require('../db');

async function awardPoints(userId, points, reason, referenceType = null, referenceId = null) {
  try {
    await db.execute(
      `INSERT INTO point_transactions (user_id, points_delta, reason, reference_type, reference_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, points, reason, referenceType, referenceId]
    );
    console.log(`✅ Awarded ${points} points to user ${userId}: ${reason}`);
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

async function awardBadge(userId, badgeCode) {
  try {
    // Get badge definition
    const [badges] = await db.execute(
      `SELECT id, points_reward FROM badge_definitions WHERE code = ? AND is_active = 1`,
      [badgeCode]
    );
    
    if (badges.length === 0) {
      console.log(`Badge ${badgeCode} not found`);
      return;
    }
    
    const badge = badges[0];
    
    // Check if user already has this badge
    const [existing] = await db.execute(
      `SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?`,
      [userId, badge.id]
    );
    
    if (existing.length > 0) {
      console.log(`User ${userId} already has badge ${badgeCode}`);
      return;
    }
    
    // Award badge
    await db.execute(
      `INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)`,
      [userId, badge.id]
    );
    
    // Award points for earning badge
    await awardPoints(userId, badge.points_reward, `Earned badge: ${badgeCode}`, 'badge', badge.id);
    
    console.log(`🏆 Awarded badge ${badgeCode} to user ${userId}`);
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
}

async function updateStreak(userId, streakType) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current active streak
    const [streaks] = await db.execute(
      `SELECT id, length_days, start_date, end_date 
       FROM user_streaks 
       WHERE user_id = ? AND streak_type = ? AND is_active = 1
       ORDER BY start_date DESC LIMIT 1`,
      [userId, streakType]
    );
    
    if (streaks.length === 0) {
      // Create new streak
      await db.execute(
        `INSERT INTO user_streaks (user_id, streak_type, length_days, start_date, is_active)
         VALUES (?, ?, 1, ?, 1)`,
        [userId, streakType, today]
      );
      console.log(`🔥 Started new ${streakType} streak for user ${userId}`);
      return;
    }
    
    const streak = streaks[0];
    const lastDate = new Date(streak.end_date || streak.start_date);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already logged today
      return;
    } else if (daysDiff === 1) {
      // Continue streak
      const newLength = streak.length_days + 1;
      await db.execute(
        `UPDATE user_streaks 
         SET length_days = ?, end_date = ?, updated_at = NOW()
         WHERE id = ?`,
        [newLength, today, streak.id]
      );
      
      // Award points for streak milestones
      if (newLength === 7) {
        await awardBadge(userId, 'STREAK_7');
      } else if (newLength === 30) {
        await awardBadge(userId, 'STREAK_30');
      }
      
      console.log(`🔥 Updated ${streakType} streak to ${newLength} days for user ${userId}`);
    } else {
      // Streak broken, start new one
      await db.execute(
        `UPDATE user_streaks SET is_active = 0 WHERE id = ?`,
        [streak.id]
      );
      
      await db.execute(
        `INSERT INTO user_streaks (user_id, streak_type, length_days, start_date, is_active)
         VALUES (?, ?, 1, ?, 1)`,
        [userId, streakType, today]
      );
      
      console.log(`💔 Streak broken. Started new ${streakType} streak for user ${userId}`);
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

async function checkWorkoutAchievements(userId) {
  try {
    const [workouts] = await db.execute(
      `SELECT COUNT(*) as total FROM user_workout_logs WHERE user_id = ?`,
      [userId]
    );
    
    const totalWorkouts = workouts[0].total;
    
    // Award FIRST_WORKOUT badge if user has at least 1 workout and doesn't have it yet
    if (totalWorkouts >= 1) {
      await awardBadge(userId, 'FIRST_WORKOUT');
    }
    if (totalWorkouts >= 50) {
      await awardBadge(userId, 'FITNESS_FANATIC');
    }
    
    // Update workout streak
    await updateStreak(userId, 'workout');
    
  } catch (error) {
    console.error('Error checking workout achievements:', error);
  }
}

async function checkWellnessAchievements(userId) {
  try {
    // Update wellness streak
    await updateStreak(userId, 'wellness');
    
    // Check for consecutive wellness logging
    const [logs] = await db.execute(
      `SELECT COUNT(DISTINCT log_date) as days
       FROM daily_wellness_logs
       WHERE user_id = ? AND log_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [userId]
    );
    
    if (logs[0].days >= 30) {
      await awardBadge(userId, 'WELLNESS_WARRIOR');
    }
    
    // Check hydration streak
    const [water] = await db.execute(
      `SELECT COUNT(DISTINCT log_date) as days
       FROM daily_wellness_logs
       WHERE user_id = ? 
       AND water_ml >= 2000 
       AND log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    
    if (water[0].days >= 7) {
      await awardBadge(userId, 'HYDRATION_HERO');
    }
    
    // Check sleep streak
    const [sleep] = await db.execute(
      `SELECT COUNT(DISTINCT log_date) as days
       FROM daily_wellness_logs
       WHERE user_id = ? 
       AND sleep_hours >= 8 
       AND log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    
    if (sleep[0].days >= 7) {
      await awardBadge(userId, 'SLEEP_CHAMPION');
    }
    
  } catch (error) {
    console.error('Error checking wellness achievements:', error);
  }
}

function calculateWellnessScore(sleepHours, waterCount, moodScore) {
  const sleepScore = Math.min(sleepHours / 8, 1);
  const waterScore = Math.min(waterCount / 8, 1);
  const moodScoreNormalized = moodScore / 10;
  
  const overallScore = ((sleepScore + waterScore + moodScoreNormalized) / 3) * 100;
  return Math.round(overallScore * 100) / 100; // Round to 2 decimal places
}

module.exports = {
  awardPoints,
  awardBadge,
  updateStreak,
  checkWorkoutAchievements,
  checkWellnessAchievements,
  calculateWellnessScore
};
