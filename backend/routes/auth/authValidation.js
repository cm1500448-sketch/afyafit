exports.validateRegistration = (data) => {
  const { name, email, password, phone_number, role, age, fitness_level } = data;

  if (!name || name.trim().length === 0)
    return { valid: false, error: 'Name is required' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return { valid: false, error: 'Valid email is required' };

  const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!password || !passwordStrength.test(password))
    return { valid: false, error: 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character (e.g. @$!%*?&#)' };

  if (phone_number) {
    const phoneRegex = /^(\+?254|0)[17]\d{8}$|^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone_number.replace(/\s/g, '')))
      return { valid: false, error: 'Valid phone number is required (e.g. 0722637467)' };
  }

  if (role === 'youth') {
    if (!age) return { valid: false, error: 'Age is required for youth accounts' };
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 6 || parsedAge > 35)
      return { valid: false, error: 'Age must be between 6 and 35 for youth accounts' };
    if (!fitness_level) return { valid: false, error: 'Fitness level is required for youth accounts' };
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(fitness_level))
      return { valid: false, error: 'Fitness level must be Beginner, Intermediate, or Advanced' };
  }

  const allowedRoles = ['youth', 'parent', 'coach'];
  if (role && !allowedRoles.includes(role))
    return { valid: false, error: 'Invalid role. Must be youth, parent, or coach.' };

  return { valid: true };
};

exports.validateLogin = (data) => {
  const { email, password } = data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return { valid: false, error: 'Valid email is required' };
  if (!password)
    return { valid: false, error: 'Password is required' };
  return { valid: true };
};

exports.validateProfileUpdate = (data) => {
  const { height, weight, goal_weight, age } = data;
  if (height && (height < 50 || height > 300))
    return { valid: false, error: 'Height must be between 50 and 300 cm' };
  if (weight && (weight < 20 || weight > 500))
    return { valid: false, error: 'Weight must be between 20 and 500 kg' };
  if (goal_weight && (goal_weight < 20 || goal_weight > 500))
    return { valid: false, error: 'Goal weight must be between 20 and 500 kg' };
  if (age && (parseInt(age) < 6 || parseInt(age) > 35))
    return { valid: false, error: 'Age must be between 6 and 35' };
  return { valid: true };
};

exports.validatePasswordReset = (data) => {
  const { token, newPassword } = data;
  if (!token) return { valid: false, error: 'Reset token is required' };
  if (!newPassword || newPassword.length < 8)
    return { valid: false, error: 'Password must be at least 8 characters' };
  const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordStrength.test(newPassword))
    return { valid: false, error: 'Password must include an uppercase letter, lowercase letter, number, and special character' };
  return { valid: true };
};

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return { valid: false, error: 'Valid email is required' };
  return { valid: true };
};
