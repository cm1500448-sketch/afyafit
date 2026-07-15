import ForgotPasswordForm from './components/ForgotPasswordForm';
import LoginForm from './components/LoginForm';
import OtpVerificationForm from './components/OtpVerificationForm';
import RegisterForm from './components/RegisterForm';
import useAuthForm from './hooks/useAuthForm';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const {
    isLogin,
    isForgotPassword,
    isVerifyingOtp,
    pendingEmail,
    showPassword,
    showConfirmPassword,
    error,
    successMessage,
    form,
    handleChange,
    handleSubmit,
    handleForgotPassword,
    handleVerifyOtp,
    handleResendOtp,
    setShowPassword,
    setShowConfirmPassword,
    switchToLogin,
    switchToRegister,
    switchToForgotPassword,
    backToLogin
  } = useAuthForm(onLoginSuccess);

  if (isVerifyingOtp) {
    return (
      <OtpVerificationForm
        email={pendingEmail}
        onVerified={handleVerifyOtp}
        onResend={handleResendOtp}
        error={error}
        successMessage={successMessage}
      />
    );
  }

  if (isForgotPassword) {
    return (
      <ForgotPasswordForm
        email={form.email}
        error={error}
        successMessage={successMessage}
        onEmailChange={handleChange}
        onSubmit={handleForgotPassword}
        onBackToLogin={backToLogin}
      />
    );
  }

  if (isLogin) {
    return (
      <LoginForm
        form={form}
        showPassword={showPassword}
        error={error}
        successMessage={successMessage}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onForgotPassword={switchToForgotPassword}
        onSwitchToRegister={switchToRegister}
      />
    );
  }

  return (
    <RegisterForm
      form={form}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      error={error}
      successMessage={successMessage}
      onFormChange={handleChange}
      onSubmit={handleSubmit}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      onSwitchToLogin={switchToLogin}
    />
  );
};

export default Auth;
