const db = require('../db');

async function createNotification(userId, type, title, message, actionUrl = null) {
  try {
    await db.execute(
      'INSERT INTO notifications (user_id, type, title, message, action_url) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, actionUrl]
    );
  } catch (err) {
    console.error('createNotification error:', err.message);
  }
}

async function getAdminIds() {
  const [rows] = await db.execute(
    `SELECT u.id FROM users u
     JOIN roles r ON u.primary_role_id = r.id
     WHERE r.name = 'admin' AND u.status = 'active'`
  );
  return rows.map(r => r.id);
}

async function notifyAdmins(type, title, message, actionUrl = null) {
  const adminIds = await getAdminIds();
  for (const id of adminIds) {
    await createNotification(id, type, title, message, actionUrl);
  }
}

module.exports = { createNotification, notifyAdmins };
