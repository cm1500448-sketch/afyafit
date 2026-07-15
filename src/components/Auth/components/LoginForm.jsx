import { Eye, EyeOff } from "lucide-react";

const LoginForm = ({
  form,
  showPassword,
  error,
  successMessage,
  onFormChange,
  onSubmit,
  onTogglePassword,
  onForgotPassword,
  onSwitchToRegister
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">AFYAFIT</h1>
        <h2>Login</h2>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={onSubmit}>
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

          <button type="submit" className="main-btn">
            Login
          </button>
        </form>

        <button className="forgot-password-btn" onClick={onForgotPassword}>
          Forgot Password?
        </button>

        <button className="switch-btn" onClick={onSwitchToRegister}>
          Don't have an account? Register
        </button>

      </div>
    </div>
  );
};

export default LoginForm;
