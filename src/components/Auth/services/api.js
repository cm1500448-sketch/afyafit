const API_URL = "http://localhost:5000/api";

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send reset link");
  return result;
};

export const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to reset password");
  return result;
};

export const verifyOtp = async (email, otp) => {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Verification failed");
  return result;
};

export const resendOtp = async (email) => {
  const res = await fetch(`${API_URL}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to resend code");
  return result;
};

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      password: data.password,
      age: data.age,
      fitness_level: data.fitness_level,
      role: data.role
    })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Registration failed");
  return result;
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");
  return result;
};
