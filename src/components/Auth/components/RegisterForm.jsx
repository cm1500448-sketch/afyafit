/**
 * REGISTER FORM COMPONENT
 * 
 * Displays registration form with role selection
 * Different fields for youth and parent accounts
 */

import { Eye, EyeOff } from "lucide-react";

const RegisterForm = ({ 
  form, 
  showPassword,
  showConfirmPassword,
  error, 
  successMessage,
  onFormChange, 
  onSubmit, 
  onTogglePassword,
  onToggleConfirmPassword,
  onSwitchToLogin 
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">AFYAFIT</h1>
        <h2>Create Account</h2>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={onSubmit}>
          <select
            name="role"
            value={form.role}
            onChange={onFormChange}
            required
          >
            <option value="youth">Youth Account</option>
            <option value="parent">Parent Account</option>
            <option value="coach">Apply as Coach</option>
          </select>

          {form.role === 'coach' && (
            <div className="coach-notice">
              🏋️ Coach applications are reviewed by admin before activation.
              You will be able to log in once approved.
            </div>
          )}

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onFormChange}
            required
          />

          <input
            name="phone_number"
            type="tel"
            placeholder="Phone Number (e.g., +254712345678)"
            value={form.phone_number}
            onChange={onFormChange}
            required
          />

          {form.role === "youth" && (
            <>
              <input
                name="age"
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={onFormChange}
                required
              />
              <select
                name="fitness_level"
                value={form.fitness_level}
                onChange={onFormChange}
                required
              >
                <option value="">Select Fitness Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={onFormChange}
            required
          />
          
          <div className="password-input-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={onFormChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={onTogglePassword}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="password-input-wrapper">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={onFormChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={onToggleConfirmPassword}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="main-btn">
            Register
          </button>
        </form>

        <button className="switch-btn" onClick={onSwitchToLogin}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
