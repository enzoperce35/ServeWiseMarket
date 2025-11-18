import { useState } from "react";
import { signup, login, logout } from "../api/authApi";

export default function useAuth() {
  const [authUser, setAuthUser] = useState(null);

  const handleSignup = async (formData) => {
    const data = await signup(formData);
    localStorage.setItem("token", data.token);
    setAuthUser(data.user);
    return data;
  };

  const handleLogin = async (formData) => {
    const data = await login(formData);
    localStorage.setItem("token", data.token);
    setAuthUser(data.user);
    return data;
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    setAuthUser(null);
  };

  return {
    authUser,
    handleSignup,
    handleLogin,
    handleLogout,
  };
}
