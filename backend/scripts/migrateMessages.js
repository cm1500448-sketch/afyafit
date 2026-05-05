const db = require('../db');

async function migrate() {
  try {
    console.log('Running coach_messages migration...');

    await db.execute(`
      ALTER TABLE coach_messages
      MODIFY COLUMN message_type ENUM('text','image','video','file','voice') NOT NULL DEFAULT 'text'
    `).catch(e => console.log('message_type modify:', e.message));

    await db.execute(`
      ALTER TABLE coach_messages ADD COLUMN file_url VARCHAR(1000) DEFAULT NULL
    `).catch(e => console.log('file_url:', e.message));

    await db.execute(`
      ALTER TABLE coach_messages ADD COLUMN file_name VARCHAR(255) DEFAULT NULL
    `).catch(e => console.log('file_name:', e.message));

    await db.execute(`
      ALTER TABLE coach_messages ADD COLUMN file_size INT DEFAULT NULL
    `).catch(e => console.log('file_size:', e.message));

    await db.execute(`
      ALTER TABLE coach_messages ADD COLUMN mime_type VARCHAR(100) DEFAULT NULL
    `).catch(e => console.log('mime_type:', e.message));

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
