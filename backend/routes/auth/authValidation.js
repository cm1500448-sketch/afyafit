/**
 * AUTH VALIDATION
 * 
 * This file contains validation functions for authentication.
 * Validates user input before processing.
 */

exports.validateRegistration = (data) => {
  const { name, email, password, phone_number, role, age, fitness_level } = data;

  // Name validation
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: "Valid email is required" };
  }

  // Password validation
  if (!password || password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  // Phone validation (if provided)
  if (phone_number) {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone_number)) {
      return { valid: false, error: "Valid phone number is required" };
    }
  }

  // Youth-specific validation
  // Age range: 6–35 based on African Union / Constitution of Kenya 2010 definition of youth,
  // extended down to 6 to include school-age children supervised by parents.
  if (role === 'youth') {
    if (!age) {
      return { valid: false, error: "Age is required for youth accounts" };
    }
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 6 || parsedAge > 35) {
      return {
        valid: false,
        error: "Age must be between 6 and 35 for youth accounts. AFYAFIT is designed for youth aged 6–35 (African Union / Kenya youth definition)."
      };
    }
    if (!fitness_level) {
      return { valid: false, error: "Fitness level is required for youth accounts" };
    }
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(fitness_level)) {
      return { valid: false, error: "Fitness level must be Beginner, Intermediate, or Advanced" };
    }
  }

  // Validate role is one of the allowed values
  const allowedRoles = ['youth', 'parent', 'coach'];
  if (role && !allowedRoles.includes(role)) {
    return { valid: false, error: "Invalid role. Must be youth, parent, or coach." };
  }

  return { valid: true };
};

/**
 * Validate login data
 */
exports.validateLogin = (data) => {
  const { email, password } = data;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: "Valid email is required" };
  }

  // Password validation
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  return { valid: true };
};

/**
 * Validate profile update data
 */
exports.validateProfileUpdate = (data) => {
  const { height, weight, goal_weight, age } = data;

  if (height && (height < 50 || height > 300)) {
    return { valid: false, error: "Height must be between 50 and 300 cm" };
  }

  if (weight && (weight < 20 || weight > 500)) {
    return { valid: false, error: "Weight must be between 20 and 500 kg" };
  }

  if (goal_weight && (goal_weight < 20 || goal_weight > 500)) {
    return { valid: false, error: "Goal weight must be between 20 and 500 kg" };
  }

  if (age && (parseInt(age) < 6 || parseInt(age) > 35)) {
    return { valid: false, error: "Age must be between 6 and 35" };
  }

  return { valid: true };
};

/**
 * Validate password reset data
 */
exports.validatePasswordReset = (data) => {
  const { token, newPassword } = data;

  if (!token) {
    return { valid: false, error: "Reset token is required" };
  }

  if (!newPassword || newPassword.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  return { valid: true };
};

/**
 * Validate email for forgot password
 */
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: "Valid email is required" };
  }

  return { valid: true };
};
