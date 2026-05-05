/**
 * AUTH CONTROLLER
 * 
 * This file contains all authentication business logic.
 * Each function handles one specific route.
 * 
 * Functions:
 * - register: Create new user account
 * - login: Authenticate user and generate token
 * - getCurrentUser: Get logged-in user info
 * - updateProfile: Update user profile details
 * - updateLevel: Update fitness level
 * - deleteAccount: Soft delete user account
 * - forgotPassword: Send password reset link
 * - resetPassword: Reset password with token
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const validation = require("./authValidation");
const { notifyAdmins } = require("../../utils/notificationHelper");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Register new user
 * 
 * POST /api/auth/register
 * 
 * Creates new user account with profile and role assignment
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone_number, password, age, fitness_level, role } = req.body;

    // Validate input
    const validationResult = validation.validateRegistration(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.error });
    }

    // Check if email already exists
    const [existingEmail] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if phone number already exists
    if (phone_number) {
      const [existingPhone] = await db.execute(
        "SELECT id FROM users WHERE phone_number = ?",
        [phone_number]
      );
      if (existingPhone.length > 0) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role (default to youth)
    const userRole = role || 'youth';

    // Coach applicants start as 'pending_approval' — admin must approve before they can log in
    // Youth and parent accounts are immediately active
    const accountStatus = (userRole === 'coach') ? 'pending_approval' : 'active';

    // Get or create role
    let [roleRows] = await db.execute(
      "SELECT id FROM roles WHERE name = ?",
      [userRole]
    );
    let roleId;
    
    if (roleRows.length === 0) {
      const [insertRole] = await db.execute(
        "INSERT INTO roles (name, description) VALUES (?, ?)",
        [userRole, userRole === 'parent' ? 'Parent role for monitoring youth activities'
                 : userRole === 'coach'  ? 'Coach role for guiding youth athletes'
                 : 'Default role for youth users']
      );
      roleId = insertRole.insertId;
    } else {
      roleId = roleRows[0].id;
    }

    // Create user
    const [userResult] = await db.execute(
      "INSERT INTO users (email, phone_number, password_hash, status, primary_role_id) VALUES (?, ?, ?, ?, ?)",
      [email, phone_number || null, hashedPassword, accountStatus, roleId]
    );
    const userId = userResult.insertId;

    // Parse name into first and last name
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Calculate birth date from age (for youth only)
    let dateOfBirth = null;
    if (age && userRole === 'youth') {
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(age);
      dateOfBirth = `${birthYear}-01-01`;
    }

    // Create user profile
    await db.execute(
      `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, timezone, fitness_level) 
       VALUES (?, ?, ?, ?, 'UTC', ?)`,
      [userId, firstName, lastName, dateOfBirth, fitness_level || null]
    );

    // Assign role to user
    await db.execute(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [userId, roleId]
    );

    res.json({ 
      message: userRole === 'coach'
        ? "Coach application submitted! Your account is pending admin approval. You will be able to log in once approved."
        : "User registered successfully",
      userId,
      status: accountStatus
    });

    // Notify admins about new coach application (fire-and-forget after response)
    if (userRole === 'coach') {
      const nameParts2 = (name || '').trim().split(' ');
      notifyAdmins(
        'coach_application',
        '🏋️ New Coach Application',
        `${nameParts2[0] || email} has applied to become a coach. Review their application in the admin dashboard.`,
        '/dashboard'
      ).catch(() => {});
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Login user
 * 
 * POST /api/auth/login
 * 
 * Authenticates user and returns JWT token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validationResult = validation.validateLogin(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.error });
    }

    // Find user with profile and role
    const [rows] = await db.execute(
      `SELECT u.id, u.email, u.password_hash, u.status, u.primary_role_id,
              r.name as role_name,
              up.first_name, up.last_name, up.date_of_birth, up.height_cm, up.weight_kg
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN roles r ON u.primary_role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check if account is active
    if (user.status === 'pending_approval') {
      return res.status(403).json({ 
        message: "Your coach application is pending admin approval. You will receive access once approved." 
      });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ message: "Account is not active" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Calculate age from birth date
    let age = null;
    if (user.date_of_birth) {
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    // Update last login timestamp
    await db.execute(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role_name || 'youth' },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || email,
        email: user.email,
        role: user.role_name || 'youth',
        age: age,
        height: user.height_cm,
        weight: user.weight_kg
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get current user info
 * 
 * GET /api/auth/me
 * 
 * Returns logged-in user's profile information
 */
exports.getCurrentUser = async (req, res) => {
  try {
    let rows;
    
    // Try to get user with fitness_level column
    try {
      [rows] = await db.execute(
        `SELECT u.email, u.status,
                up.first_name, up.last_name, up.date_of_birth, up.height_cm, up.weight_kg, 
                up.fitness_level, up.goal_weight_kg,
                r.name as role_name
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN roles r ON u.primary_role_id = r.id
         WHERE u.id = ?`, 
        [req.user.id]
      );
    } catch (colErr) {
      // Fallback if fitness_level or goal_weight_kg columns don't exist
      if (colErr.code === 'ER_BAD_FIELD_ERROR' || colErr.message?.includes('Unknown column')) {
        [rows] = await db.execute(
          `SELECT u.email, u.status,
                  up.first_name, up.last_name, up.date_of_birth, up.height_cm, up.weight_kg,
                  r.name as role_name
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           LEFT JOIN roles r ON u.primary_role_id = r.id
           WHERE u.id = ?`, 
          [req.user.id]
        );
      } else {
        throw colErr;
      }
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = rows[0];
    
    // Calculate age from birth date
    let age = null;
    if (user.date_of_birth) {
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }
    
    res.json({
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      age: age,
      height: user.height_cm,
      weight: user.weight_kg,
      goal_weight: user.goal_weight_kg ?? null,
      role: user.role_name || 'youth',
      fitness_level: user.fitness_level || 'Beginner'
    });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update user profile
 * 
 * PUT /api/auth/update-profile
 * 
 * Updates user's profile information
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, height, weight, goal_weight } = req.body;
    const userId = req.user.id;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User identity not found in token" });
    }

    // Validate input
    const validationResult = validation.validateProfileUpdate(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.error });
    }

    // Parse name into first and last name
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Calculate birth date from age
    let dateOfBirth = null;
    if (age) {
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(age);
      dateOfBirth = `${birthYear}-01-01`;
    }

    // Try to update with goal_weight_kg column
    try {
      await db.execute(
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, date_of_birth = ?, height_cm = ?, weight_kg = ?, goal_weight_kg = ?
         WHERE user_id = ?`,
        [firstName, lastName, dateOfBirth, height, weight, goal_weight || null, userId]
      );
    } catch (colErr) {
      // Fallback if goal_weight_kg column doesn't exist
      if (colErr.code === 'ER_BAD_FIELD_ERROR' || colErr.message?.includes('Unknown column')) {
        await db.execute(
          `UPDATE user_profiles 
           SET first_name = ?, last_name = ?, date_of_birth = ?, height_cm = ?, weight_kg = ?
           WHERE user_id = ?`,
          [firstName, lastName, dateOfBirth, height, weight, userId]
        );
      } else {
        throw colErr;
      }
    }
    
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Database update failed" });
  }
};

/**
 * Update fitness level
 * 
 * PUT /api/auth/update-level
 * 
 * Updates user's fitness level
 */
exports.updateLevel = async (req, res) => {
  try {
    const { level } = req.body;
    const userId = req.user.id;

    // Validate fitness level
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return res.status(400).json({ 
        message: "Fitness level must be Beginner, Intermediate, or Advanced" 
      });
    }
    
    // Update fitness level in user_profiles
    try {
      await db.execute(
        `UPDATE user_profiles SET fitness_level = ? WHERE user_id = ?`,
        [level, userId]
      );
    } catch (colErr) {
      // If column doesn't exist, log and continue
      if (colErr.code === 'ER_BAD_FIELD_ERROR' || colErr.message?.includes('Unknown column')) {
        console.log('fitness_level column may not exist yet');
      } else {
        throw colErr;
      }
    }
    
    res.json({ message: "Profile updated successfully!", level });
  } catch (err) {
    console.error("Update level error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete user account
 * 
 * DELETE /api/auth/delete-account
 * 
 * Soft deletes user account (sets status to 'deleted')
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Soft delete (set status to 'deleted' instead of actually deleting)
    await db.execute(
      "UPDATE users SET status = 'deleted' WHERE id = ?",
      [userId]
    );
    
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Forgot password
 * 
 * POST /api/auth/forgot-password
 * 
 * Generates password reset token and sends reset link
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const validationResult = validation.validateEmail(email);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.error });
    }

    // Check if user exists
    const [users] = await db.execute(
      "SELECT id, email FROM users WHERE email = ? AND status = 'active'",
      [email]
    );

    if (users.length === 0) {
      // For security, don't reveal if email exists or not
      return res.json({ 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    const user = users[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Create reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    // For now, just log it to console (in production, use email service)
    console.log('\n========================================');
    console.log('PASSWORD RESET LINK:');
    console.log(resetLink);
    console.log('========================================\n');

    res.json({ 
      message: "If an account exists with this email, you will receive a password reset link.",
      // For development only - remove in production:
      resetLink: resetLink
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

/**
 * Reset password
 * 
 * POST /api/auth/reset-password
 * 
 * Resets user password using reset token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    const validationResult = validation.validatePasswordReset(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.error });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Check token purpose
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: "Invalid token type" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const [result] = await db.execute(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'",
      [hashedPassword, decoded.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "User not found or account inactive" });
    }

    res.json({ 
      message: "Password reset successful. You can now login with your new password." 
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
