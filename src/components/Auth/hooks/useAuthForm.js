/**
 * AUTH FORM HOOK
 * 
 * Custom hook for authentication form logic
 * Handles login, registration, and password reset
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api.js";
import { showNotification } from "../../../utils/notification";

const useAuthForm = (onLoginSuccess) => {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    age: "",
    fitness_level: "",
    role: "youth"
  });

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
      age: "",
      fitness_level: "",
      role: "youth"
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!form.email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      setSuccessMessage("Password reset link has been sent to your email!");
      setError("");
      
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMessage("");
        resetForm();
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    }
  };

  const handleLogin = async () => {
    const data = await loginUser({ email: form.email, password: form.password });
    
    if (data.token) {
      localStorage.setItem("token", data.token);
      const userRole = data.user?.role || 'user';
      localStorage.setItem("afyafit_role", userRole);

      if (data.user && data.user.fitness_level) {
        localStorage.setItem("fitness_level", data.user.fitness_level);
      }

      console.log("✅ Logged in successfully");
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user, userRole);
      }
      
      navigate("/dashboard");
    }
  };

  const handleRegister = async () => {
    await registerUser(form);
    
    if (form.role === 'youth' || !form.role) {
      const loginData = await loginUser({ email: form.email, password: form.password });
      
      if (loginData.token) {
        localStorage.setItem("token", loginData.token);
        const userRole = loginData.user?.role || 'user';
        localStorage.setItem("afyafit_role", userRole);
        
        if (onLoginSuccess) {
          onLoginSuccess(loginData.user, userRole);
        }
        
        navigate("/onboarding");
      }
    } else {
      showNotification("✅ Account created! Please login.", "success");
      setIsLogin(true);
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }
    
    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!isLogin && form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (!isLogin && form.role === "youth") {
      if (!form.name || !form.age || !form.fitness_level || !form.phone_number) {
        setError("Please fill in all required fields");
        return;
      }
    }
    
    if (!isLogin && form.role === "parent") {
      if (!form.name || !form.phone_number) {
        setError("Please enter your name and phone number");
        return;
      }
    }
    
    if (!isLogin && form.phone_number) {
      if (!validatePhone(form.phone_number)) {
        setError("Please enter a valid phone number");
        return;
      }
    }
    
    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setError("");
    setSuccessMessage("");
    resetForm();
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setError("");
    setSuccessMessage("");
    resetForm();
  };

  const switchToForgotPassword = () => {
    setIsForgotPassword(true);
    setError("");
    setSuccessMessage("");
  };

  const backToLogin = () => {
    setIsForgotPassword(false);
    setError("");
    setSuccessMessage("");
  };

  return {
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
  };
};

export default useAuthForm;
