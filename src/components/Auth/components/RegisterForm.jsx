import { Eye, EyeOff } from 'lucide-react';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[a-z]/.test(password))        score++;
  if (/\d/.test(password))           score++;
  if (/[@$!%*?&#]/.test(password))   score++;

  if (score <= 2) return { score, label: 'Weak',   color: '#ef4444' };
  if (score === 3) return { score, label: 'Fair',   color: '#f97316' };
  if (score === 4) return { score, label: 'Good',   color: '#eab308' };
  return             { score, label: 'Strong', color: '#22c55e' };
}

const RegisterForm = ({
  form, showPassword, showConfirmPassword, error, successMessage,
  onFormChange, onSubmit, onTogglePassword, onToggleConfirmPassword, onSwitchToLogin
}) => {
  const strength = getPasswordStrength(form.password);

  const requirements = [
    { met: form.password.length >= 8,         text: 'At least 8 characters' },
    { met: /[A-Z]/.test(form.password),       text: 'One uppercase letter' },
    { met: /[a-z]/.test(form.password),       text: 'One lowercase letter' },
    { met: /\d/.test(form.password),          text: 'One number' },
    { met: /[@$!%*?&#]/.test(form.password),  text: 'One special character (@$!%*?&#)' }
  ];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">AFYAFIT</h1>
        <h2>Create Account</h2>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={onSubmit}>
          <select name="role" value={form.role} onChange={onFormChange} required>
            <option value="youth">Youth Account</option>
            <option value="parent">Parent Account</option>
            <option value="coach">Apply as Coach</option>
          </select>

          {form.role === 'coach' && (
            <div className="coach-notice">
              Coach applications are reviewed by admin before activation.
              You will be able to log in once approved.
            </div>
          )}

          <input name="name" placeholder="Full Name" value={form.name} onChange={onFormChange} required />
          <input name="phone_number" type="tel" placeholder="Phone Number (e.g., +254712345678)" value={form.phone_number} onChange={onFormChange} required />

          {form.role === 'youth' && (
            <>
              <input name="age" type="number" placeholder="Age" value={form.age} onChange={onFormChange} required />
              <select name="fitness_level" value={form.fitness_level} onChange={onFormChange} required>
                <option value="">Select Fitness Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </>
          )}

          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={onFormChange} required />

          <div className="password-input-wrapper">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={onFormChange}
              required
            />
            <button type="button" className="password-toggle" onClick={onTogglePassword} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {form.password && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Password strength</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: strength.color }}>{strength.label}</span>
              </div>
              <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${(strength.score / 5) * 100}%`, background: strength.color, borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0' }}>
                {requirements.map((req, i) => (
                  <li key={i} style={{ fontSize: '11px', color: req.met ? '#22c55e' : '#94a3b8', marginBottom: '2px' }}>
                    {req.met ? '✓' : '○'} {req.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="password-input-wrapper">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={onFormChange}
              required
            />
            <button type="button" className="password-toggle" onClick={onToggleConfirmPassword} aria-label="Toggle confirm password visibility">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p style={{ fontSize: '12px', color: '#ef4444', margin: '-8px 0 8px 0' }}>Passwords do not match</p>
          )}

          <button type="submit" className="main-btn">Register</button>
        </form>

        <button className="switch-btn" onClick={onSwitchToLogin}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
