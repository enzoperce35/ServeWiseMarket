// src/hooks/useAuth.js
import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error("Fetch user failed:", err.response?.data || err.message);
      setUser(null);
    }
  };

  const handleSignup = async (data) => {
    try {
      const payload = { ...data, role: "buyer" };
      const res = await axios.post(`${BASE_URL}/signup`, { user: payload });
      localStorage.setItem("token", res.data.token);
      await fetchUser();
      return { status: "ok" };
    } catch (err) {
      return { status: "error", errors: err.response?.data?.errors || [err.message] };
    }
  };

  const handleLogin = async ({ contact_number, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { contact_number, password });
      localStorage.setItem("token", res.data.token);
      const freshUser = await fetchUser();
      return { status: "ok", user: freshUser };
    } catch {
      return { status: "error", errors: ["Invalid login credentials"] };
    }
  };

  const handleLogout = (navigate) => {
    localStorage.removeItem("token");
    setUser(null);
    if (navigate) navigate("/login");
  };

  const updateUserShop = async (updates) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE_URL}/seller/shop`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local user context
      setUser((prev) => ({
        ...prev,
        shop: { ...prev.shop, ...updates },
      }));

      return res.data;
    } catch (err) {
      console.error("Failed to update shop:", err.response?.data || err.message);
      throw err;
    }
  };

  return {
    user,
    setUser,
    fetchUser,
    handleSignup,
    handleLogin,
    handleLogout,
    updateUserShop,
  };
}
