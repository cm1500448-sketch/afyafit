const db = require('../db');

async function migrate() {
  try {
    console.log('Creating notifications table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        user_id      INT NOT NULL,
        type         VARCHAR(50) NOT NULL,
        title        VARCHAR(255) NOT NULL,
        message      TEXT NOT NULL,
        action_url   VARCHAR(255) DEFAULT NULL,
        is_read      TINYINT(1) DEFAULT 0,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_unread (user_id, is_read),
        INDEX idx_user_created (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('Notifications table ready.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
