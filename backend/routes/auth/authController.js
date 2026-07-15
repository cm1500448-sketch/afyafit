const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const validation = require('./authValidation');
const { notifyAdmins } = require('../../utils/notificationHelper');
const { sendPasswordResetEmail, sendOtpEmail } = require('../../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { name, email, phone_number, password, age, fitness_level, role } = req.body;

    const check = validation.validateRegistration(req.body);
    if (!check.valid) return res.status(400).json({ message: check.error });

    const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    if (phone_number) {
      const [existingPhone] = await db.execute('SELECT id FROM users WHERE phone_number = ?', [phone_number]);
      if (existingPhone.length > 0)
        return res.status(400).json({ message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'youth';

    const accountStatus = userRole === 'coach' ? 'pending_approval' : 'pending_verification';

    let [roleRows] = await db.execute('SELECT id FROM roles WHERE name = ?', [userRole]);
    let roleId;

    if (roleRows.length === 0) {
      const [insertRole] = await db.execute(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [userRole, userRole === 'parent' ? 'Parent role' : userRole === 'coach' ? 'Coach role' : 'Youth role']
      );
      roleId = insertRole.insertId;
    } else {
      roleId = roleRows[0].id;
    }

    const [userResult] = await db.execute(
      'INSERT INTO users (email, phone_number, password_hash, status, primary_role_id) VALUES (?, ?, ?, ?, ?)',
      [email, phone_number || null, hashedPassword, accountStatus, roleId]
    );
    const userId = userResult.insertId;

    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let dateOfBirth = null;
    if (age && userRole === 'youth') {
      const birthYear = new Date().getFullYear() - parseInt(age);
      dateOfBirth = `${birthYear}-01-01`;
    }

    await db.execute(
      `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, timezone, fitness_level)
       VALUES (?, ?, ?, ?, 'UTC', ?)`,
      [userId, firstName, lastName, dateOfBirth, fitness_level || null]
    );

    await db.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);

    if (userRole !== 'coach') {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.execute('DELETE FROM otp_verifications WHERE email = ?', [email.toLowerCase()]);
      await db.execute(
        'INSERT INTO otp_verifications (email, otp, user_id, expires_at) VALUES (?, ?, ?, ?)',
        [email.toLowerCase(), otp, userId, expiresAt]
      );
      sendOtpEmail(email, otp, firstName).catch(err => console.error('OTP email error:', err));
    }

    res.json({
      message: userRole === 'coach'
        ? 'Coach application submitted! Pending admin approval.'
        : 'Verification code sent to your email.',
      userId,
      status: accountStatus,
      requiresVerification: userRole !== 'coach'
    });

    if (userRole === 'coach') {
      notifyAdmins(
        'coach_application',
        'New Coach Application',
        `${firstName || email} has applied to become a coach.`,
        '/dashboard'
      ).catch(() => {});
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const check = validation.validateLogin(req.body);
    if (!check.valid) return res.status(400).json({ message: check.error });

    const [rows] = await db.execute(
      `SELECT u.id, u.email, u.password_hash, u.status,
              r.name as role_name,
              up.first_name, up.last_name, up.date_of_birth, up.height_cm, up.weight_kg
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN roles r ON u.primary_role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: 'User not found' });

    const user = rows[0];

    if (user.status === 'pending_approval')
      return res.status(403).json({ message: 'Your coach application is pending admin approval.' });

    if (user.status === 'pending_verification')
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email
      });

    if (user.status !== 'active')
      return res.status(403).json({ message: 'Account is not active' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(400).json({ message: 'Invalid password' });

    let age = null;
    if (user.date_of_birth) {
      age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
    }

    await db.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role_name || 'youth' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || email,
        email: user.email,
        role: user.role_name || 'youth',
        age,
        height: user.height_cm,
        weight: user.weight_kg
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await db.execute(
        `SELECT u.email, up.first_name, up.last_name, up.date_of_birth,
                up.height_cm, up.weight_kg, up.fitness_level, up.goal_weight_kg,
                r.name as role_name
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN roles r ON u.primary_role_id = r.id
         WHERE u.id = ?`,
        [req.user.id]
      );
    } catch (colErr) {
      if (colErr.code === 'ER_BAD_FIELD_ERROR' || colErr.message?.includes('Unknown column')) {
        [rows] = await db.execute(
          `SELECT u.email, up.first_name, up.last_name, up.date_of_birth,
                  up.height_cm, up.weight_kg, r.name as role_name
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           LEFT JOIN roles r ON u.primary_role_id = r.id
           WHERE u.id = ?`,
          [req.user.id]
        );
      } else throw colErr;
    }

    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    let age = null;
    if (user.date_of_birth) {
      age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
    }

    res.json({
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      age,
      height: user.height_cm,
      weight: user.weight_kg,
      goal_weight: user.goal_weight_kg ?? null,
      role: user.role_name || 'youth',
      fitness_level: user.fitness_level || 'Beginner'
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, age, height, weight, goal_weight } = req.body;
    const userId = req.user.id;

    const check = validation.validateProfileUpdate(req.body);
    if (!check.valid) return res.status(400).json({ message: check.error });

    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let dateOfBirth = null;
    if (age) {
      const birthYear = new Date().getFullYear() - parseInt(age);
      dateOfBirth = `${birthYear}-01-01`;
    }

    try {
      await db.execute(
        `UPDATE user_profiles
         SET first_name = ?, last_name = ?, date_of_birth = ?, height_cm = ?, weight_kg = ?, goal_weight_kg = ?
         WHERE user_id = ?`,
        [firstName, lastName, dateOfBirth, height, weight, goal_weight || null, userId]
      );
    } catch (colErr) {
      if (colErr.code === 'ER_BAD_FIELD_ERROR' || colErr.message?.includes('Unknown column')) {
        await db.execute(
          `UPDATE user_profiles
           SET first_name = ?, last_name = ?, date_of_birth = ?, height_cm = ?, weight_kg = ?
           WHERE user_id = ?`,
          [firstName, lastName, dateOfBirth, height, weight, userId]
        );
      } else throw colErr;
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
};

exports.updateLevel = async (req, res) => {
  try {
    const { level } = req.body;
    const userId = req.user.id;

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level))
      return res.status(400).json({ message: 'Fitness level must be Beginner, Intermediate, or Advanced' });

    await db.execute('UPDATE user_profiles SET fitness_level = ? WHERE user_id = ?', [level, userId]);
    res.json({ message: 'Fitness level updated', level });
  } catch (err) {
    console.error('Update level error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await db.execute("UPDATE users SET status = 'deleted' WHERE id = ?", [req.user.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const key = email.toLowerCase();
    const [records] = await db.execute(
      'SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [key]
    );

    if (records.length === 0)
      return res.status(400).json({ message: 'No verification code found. Please register again.' });

    const record = records[0];

    if (new Date() > new Date(record.expires_at)) {
      await db.execute('DELETE FROM otp_verifications WHERE email = ?', [key]);
      return res.status(400).json({ message: 'Verification code has expired. Request a new one.' });
    }

    if (record.otp !== String(otp).trim())
      return res.status(400).json({ message: 'Incorrect verification code.' });

    await db.execute("UPDATE users SET status = 'active' WHERE id = ?", [record.user_id]);
    await db.execute('DELETE FROM otp_verifications WHERE email = ?', [key]);

    const [updatedUser] = await db.execute('SELECT status FROM users WHERE id = ?', [record.user_id]);
    if (!updatedUser.length || updatedUser[0].status !== 'active')
      return res.status(500).json({ message: 'Failed to activate account.' });

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [users] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND status = 'pending_verification'",
      [email]
    );
    if (users.length === 0)
      return res.status(400).json({ message: 'No pending account found for this email.' });

    const [profileRows] = await db.execute(
      'SELECT first_name FROM user_profiles WHERE user_id = ?',
      [users[0].id]
    );
    const firstName = profileRows[0]?.first_name || '';
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute('DELETE FROM otp_verifications WHERE email = ?', [email.toLowerCase()]);
    await db.execute(
      'INSERT INTO otp_verifications (email, otp, user_id, expires_at) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), otp, users[0].id, expiresAt]
    );
    await sendOtpEmail(email, otp, firstName);

    res.json({ message: 'New verification code sent to your email.' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const check = validation.validateEmail(email);
    if (!check.valid) return res.status(400).json({ message: check.error });

    const [users] = await db.execute(
      "SELECT id, email FROM users WHERE email = ? AND status = 'active'",
      [email]
    );

    if (users.length === 0)
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });

    const resetToken = jwt.sign(
      { id: users[0].id, email: users[0].email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(users[0].email, resetLink);
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const check = validation.validatePasswordReset(req.body);
    if (!check.valid) return res.status(400).json({ message: check.error });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'password-reset')
      return res.status(400).json({ message: 'Invalid token type' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.execute(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'",
      [hashedPassword, decoded.id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ message: 'User not found or account inactive' });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
