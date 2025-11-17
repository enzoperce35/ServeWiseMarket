// src/hooks/useAuth.js
import { useState } from "react";
import authApi from "../api/authApi";

export default function useAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  const login = async (contact_number, password) => {
    const res = await authApi.login({ contact_number, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (userData) => {
    const res = await authApi.signup(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, signup, logout };
}
