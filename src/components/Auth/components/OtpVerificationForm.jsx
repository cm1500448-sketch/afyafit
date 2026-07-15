import { useEffect, useRef, useState } from 'react';

const OtpVerificationForm = ({ email, onVerified, onResend, error, successMessage }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) return;
    onVerified(otp);
  };

  const handleResend = () => {
    setResendTimer(60);
    setDigits(['', '', '', '', '', '']);
    onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">AFYAFIT</h1>
        <h2>Verify Your Email</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: '#1e293b' }}>{email}</strong>
        </p>

        {error          && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                style={{
                  width: '48px', height: '56px', textAlign: 'center',
                  fontSize: '1.5rem', fontWeight: '700',
                  border: '2px solid', borderRadius: '8px', outline: 'none',
                  borderColor: d ? '#4f46e5' : '#e2e8f0'
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button type="submit" className="main-btn" disabled={digits.join('').length < 6}>
            Verify Email
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {resendTimer > 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Resend code in {resendTimer}s
            </p>
          ) : (
            <button className="switch-btn" onClick={handleResend}>
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationForm;
