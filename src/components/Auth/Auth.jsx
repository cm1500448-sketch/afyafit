/**
 * AUTH - MAIN COMPONENT
 * 
 * Handles user authentication
 * Shows login, register, or forgot password forms
 */

import ForgotPasswordForm from "./components/ForgotPasswordForm";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import useAuthForm from "./hooks/useAuthForm";
import "./Auth.css";

const Auth = ({ onLoginSuccess }) => {
  const {
    isLogin,
    isForgotPassword,
    showPassword,
    showConfirmPassword,
    error,
    successMessage,
    form,
    handleChange,
    handleSubmit,
    handleForgotPassword,
    setShowPassword,
    setShowConfirmPassword,
    switchToLogin,
    switchToRegister,
    switchToForgotPassword,
    backToLogin
  } = useAuthForm(onLoginSuccess);

  // Show forgot password form
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

  // Show login form
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

  // Show register form
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
