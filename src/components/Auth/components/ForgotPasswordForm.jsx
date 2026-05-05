/**
 * FORGOT PASSWORD FORM COMPONENT
 * 
 * Displays password reset form
 * Sends reset link to user's email
 */

const ForgotPasswordForm = ({ 
  email, 
  error, 
  successMessage, 
  onEmailChange, 
  onSubmit, 
  onBackToLogin 
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">AFYAFIT</h1>
        <h2>Reset Password</h2>
        
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={onSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={onEmailChange}
            required
          />
          <button type="submit" className="main-btn">
            Send Reset Link
          </button>
        </form>

        <button className="switch-btn" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
