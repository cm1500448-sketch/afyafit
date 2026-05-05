const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'youth_fitness',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

const badges = [
  { code: 'FIRST_WORKOUT',    name: 'First Steps',       description: 'Complete your first workout',              icon_url: '🏃', points_reward: 50  },
  { code: 'HYDRATION_HERO',   name: 'Hydration Hero',    description: 'Drink 8 cups of water for 7 days straight', icon_url: '💧', points_reward: 100 },
  { code: 'WEEK_WARRIOR',     name: 'Week Warrior',      description: 'Complete 7 workouts in a week',            icon_url: '⚔️', points_reward: 150 },
  { code: 'SLEEP_CHAMPION',   name: 'Sleep Champion',    description: 'Get 8 hours of sleep for 7 days straight', icon_url: '😴', points_reward: 100 },
  { code: 'POINT_MASTER',     name: 'Point Master',      description: 'Earn 1000 points',                         icon_url: '⭐', points_reward: 200 },
  { code: 'CONSISTENCY_KING', name: 'Consistency King',  description: 'Maintain a 30-day wellness streak',        icon_url: '👑', points_reward: 300 },
  { code: 'FITNESS_FANATIC',  name: 'Fitness Fanatic',   description: 'Complete 50 workouts',                     icon_url: '💪', points_reward: 250 },
  { code: 'WELLNESS_WARRIOR', name: 'Wellness Warrior',  description: 'Log wellness data for 30 days',            icon_url: '🌟', points_reward: 200 },
  { code: 'STREAK_7',         name: '7-Day Streak',      description: 'Maintain a 7-day activity streak',         icon_url: '🔥', points_reward: 100 },
  { code: 'STREAK_30',        name: '30-Day Streak',     description: 'Maintain a 30-day activity streak',        icon_url: '🏆', points_reward: 300 },
];

async function seedBadges() {
  try {
    console.log('🌱 Seeding badge definitions...');
    
    for (const badge of badges) {
      const [existing] = await db.execute(
        'SELECT id FROM badge_definitions WHERE code = ?',
        [badge.code]
      );
      
      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO badge_definitions (code, name, description, icon_url, points_reward, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [badge.code, badge.name, badge.description, badge.icon_url, badge.points_reward]
        );
        console.log(`✅ Created badge: ${badge.name}`);
      } else {
        // Update existing badge with points_reward and icon
        await db.execute(
          `UPDATE badge_definitions SET points_reward = ?, icon_url = ? WHERE code = ?`,
          [badge.points_reward, badge.icon_url, badge.code]
        );
        console.log(`🔄 Updated badge: ${badge.name}`);
      }
    }
    
    console.log('✨ Badge seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
}

seedBadges();
