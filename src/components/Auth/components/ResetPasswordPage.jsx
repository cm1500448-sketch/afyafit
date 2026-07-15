import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api.js';
import '../Auth.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [loading, setLoading]                 = useState(false);

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="logo">AFYAFIT</h1>
          <h2>Invalid Link</h2>
          <p className="error-message">
            This password reset link is invalid or has expired.
          </p>
          <button className="main-btn" onClick={() => navigate('/auth')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/auth'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">AFYAFIT</h1>
        <h2>Set New Password</h2>

        {error   && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="password-input-wrapper">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                required
                minLength={6}
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNew(v => !v)}
                tabIndex={-1}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="password-input-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>

            <button type="submit" className="main-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <button className="switch-btn" onClick={() => navigate('/auth')}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
