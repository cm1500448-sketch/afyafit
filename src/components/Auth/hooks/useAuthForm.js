import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  forgotPassword as apiForgotPassword,
  loginUser,
  registerUser,
  resendOtp as apiResendOtp,
  verifyOtp as apiVerifyOtp
} from '../services/api.js';
import { showNotification } from '../../../utils/notification';

const useAuthForm = (onLoginSuccess) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    age: '',
    fitness_level: '',
    role: 'youth'
  });

  const resetForm = () => setForm({
    name: '', email: '', phone_number: '', password: '',
    confirmPassword: '', age: '', fitness_level: '', role: 'youth'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+?254|0)[17]\d{8}$|^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) return setError('Please enter your email address');
    if (!validateEmail(form.email)) return setError('Please enter a valid email address');
    try {
      setError('');
      await apiForgotPassword(form.email);
      setSuccessMessage('If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleLogin = async () => {
    const data = await loginUser({ email: form.email, password: form.password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      const userRole = data.user?.role || 'user';
      localStorage.setItem('afyafit_role', userRole);
      if (data.user?.fitness_level) localStorage.setItem('fitness_level', data.user.fitness_level);
      if (onLoginSuccess) onLoginSuccess(data.user, userRole);
      navigate('/dashboard');
    }
  };

  const handleRegister = async () => {
    const result = await registerUser(form);
    if (result.requiresVerification) {
      setPendingEmail(form.email);
      setIsVerifyingOtp(true);
      setError('');
      return;
    }
    showNotification('Account created! Please login.', 'success');
    setIsLogin(true);
    resetForm();
  };

  const handleVerifyOtp = async (otp) => {
    try {
      setError('');
      await apiVerifyOtp(pendingEmail, otp);
      await new Promise(resolve => setTimeout(resolve, 300));
      const loginData = await loginUser({ email: pendingEmail, password: form.password });
      if (loginData.token) {
        localStorage.setItem('token', loginData.token);
        const userRole = loginData.user?.role || 'user';
        localStorage.setItem('afyafit_role', userRole);
        if (onLoginSuccess) onLoginSuccess(loginData.user, userRole);
        navigate(userRole === 'youth' || userRole === 'user' ? '/onboarding' : '/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      await apiResendOtp(pendingEmail);
      setSuccessMessage('New code sent to your email.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(form.email)) return setError('Please enter a valid email address');
    if (!form.email || !form.password) return setError('Email and password are required');

    if (!isLogin) {
      if (form.password !== form.confirmPassword) return setError('Passwords do not match');
      if (form.password.length < 8) return setError('Password must be at least 8 characters');
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!strongPassword.test(form.password))
        return setError('Password must include an uppercase letter, lowercase letter, number, and special character (@$!%*?&#)');
      if (form.role === 'youth' && (!form.name || !form.age || !form.fitness_level || !form.phone_number))
        return setError('Please fill in all required fields');
      if (form.role === 'parent' && (!form.name || !form.phone_number))
        return setError('Please enter your name and phone number');
      if (form.phone_number && !validatePhone(form.phone_number))
        return setError('Please enter a valid phone number');
    }

    try {
      if (isLogin) await handleLogin();
      else await handleRegister();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const switchToLogin = () => { setIsLogin(true); setError(''); setSuccessMessage(''); resetForm(); };
  const switchToRegister = () => { setIsLogin(false); setError(''); setSuccessMessage(''); resetForm(); };
  const switchToForgotPassword = () => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); };
  const backToLogin = () => { setIsForgotPassword(false); setError(''); setSuccessMessage(''); };

  return {
    isLogin, isForgotPassword, isVerifyingOtp, pendingEmail,
    showPassword, showConfirmPassword, error, successMessage, form,
    handleChange, handleSubmit, handleForgotPassword, handleVerifyOtp,
    handleResendOtp, setShowPassword, setShowConfirmPassword,
    switchToLogin, switchToRegister, switchToForgotPassword, backToLogin
  };
};

export default useAuthForm;
