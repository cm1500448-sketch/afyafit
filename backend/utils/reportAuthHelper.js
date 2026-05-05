
const db = require('../db');

async function authorizeReportAccess(requestingUserId, requestingUserRole, targetUserId) {
  try {
    // Admin can access any report
    if (requestingUserRole === 'admin') {
      return { authorized: true, reason: 'Admin access' };
    }

    // User accessing their own report
    if (requestingUserId === targetUserId) {
      return { authorized: true, reason: 'Own report' };
    }

    // Parent accessing child's report
    if (requestingUserRole === 'parent') {
      const [relationship] = await db.execute(
        `SELECT id FROM parent_youth_relationships
         WHERE parent_id = ? AND youth_id = ?`,
        [requestingUserId, targetUserId]
      );

      if (relationship.length > 0) {
        return { authorized: true, reason: 'Parent-child relationship' };
      }
    }

    // Coach accessing assigned user's report
    if (requestingUserRole === 'coach') {
      const [assignment] = await db.execute(
        `SELECT id FROM coach_assignments
         WHERE coach_id = ? AND user_id = ?`,
        [requestingUserId, targetUserId]
      );

      if (assignment.length > 0) {
        return { authorized: true, reason: 'Coach assignment' };
      }
    }

    // No authorization found
    return { 
      authorized: false, 
      reason: 'No permission to access this report' 
    };
  } catch (error) {
    console.error('Error in authorizeReportAccess:', error);
    return { 
      authorized: false, 
      reason: 'Authorization check failed' 
    };
  }
}

async function getUserRole(userId) {
  try {
    const [rows] = await db.execute(
      `SELECT r.name as role_name
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    return rows[0]?.role_name || 'youth';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'youth';
  }
}

async function getUserInfo(userId) {
  try {
    const [rows] = await db.execute(
      `SELECT 
        COALESCE(CONCAT(up.first_name, ' ', up.last_name), u.email) as name,
        u.email
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return {
      name: rows[0].name,
      email: rows[0].email
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

module.exports = {
  authorizeReportAccess,
  getUserRole,
  getUserInfo
};
