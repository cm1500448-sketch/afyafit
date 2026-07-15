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
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error          && <p className="error-message">{error}</p>}
        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={onSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={onEmailChange}
              required
              autoFocus
            />
            <button type="submit" className="main-btn">
              Send Reset Link
            </button>
          </form>
        )}

        <button className="switch-btn" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
