/**
 * NOTIFICATION HELPER
 *
 * Central utility for creating in-app notifications.
 * Call createNotification() from any route whenever an action
 * requires another user to be informed.
 *
 * Notification types:
 *   coach_request        — youth requested a coach (→ admin)
 *   coach_application    — someone applied as coach (→ admin)
 *   coach_approved       — admin approved coach application (→ coach)
 *   coach_rejected       — admin rejected coach application (→ coach)
 *   coach_assigned       — admin assigned a coach (→ youth + coach)
 *   new_message          — new chat message (→ recipient)
 *   red_flag             — coach flagged health concern (→ parent)
 *   wellness_streak      — user hit a streak milestone (→ user)
 *   badge_earned         — user earned a badge (→ user)
 */

const db = require('../db');

/**
 * Create a notification for a user.
 *
 * @param {number} userId     - Recipient user ID
 * @param {string} type       - Notification type key
 * @param {string} title      - Short title (shown in bell dropdown)
 * @param {string} message    - Full message text
 * @param {string} actionUrl  - Optional frontend route to navigate to on click
 */
async function createNotification(userId, type, title, message, actionUrl = null) {
  try {
    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, action_url)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, actionUrl]
    );
  } catch (err) {
    // Never let notification failure break the main request
    console.error('createNotification error:', err.message);
  }
}

/**
 * Get all admin user IDs (to notify all admins at once).
 */
async function getAdminIds() {
  const [rows] = await db.execute(
    `SELECT u.id FROM users u
     JOIN roles r ON u.primary_role_id = r.id
     WHERE r.name = 'admin' AND u.status = 'active'`
  );
  return rows.map(r => r.id);
}

/**
 * Notify all admins with the same message.
 */
async function notifyAdmins(type, title, message, actionUrl = null) {
  const adminIds = await getAdminIds();
  for (const id of adminIds) {
    await createNotification(id, type, title, message, actionUrl);
  }
}

module.exports = { createNotification, notifyAdmins };
