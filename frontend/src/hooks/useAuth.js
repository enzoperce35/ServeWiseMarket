import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export default function useAuth() {
  const [user, setUser] = useState(null);

  // Fetch current logged-in user if token exists
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user); // includes shop if exists
      return res.data.user;
    } catch (err) {
      console.error("Fetch user failed:", err.response?.data || err.message);
      setUser(null);
    }
  };

  // Signup
  const handleSignup = async (data) => {
    try {
      const payload = { ...data, role: "buyer" };
      const res = await axios.post(`${BASE_URL}/signup`, { user: payload });

      localStorage.setItem("token", res.data.token);

      // Fetch user after signup
      await fetchUser();

      return { status: "ok" }; // <-- THIS IS THE FIX
    } catch (err) {
      return { status: "error", errors: err.response?.data?.errors || [err.message] };
    }
  };

  // Login
  const handleLogin = async ({ contact_number, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        contact_number,
        password,
      });

      localStorage.setItem("token", res.data.token);

      // 🔥 instead of using stale user, fetch complete user again
      const freshUser = await fetchUser();
      return { status: "ok", user: freshUser };
    } catch (err) {
      return { status: "error", errors: ["Invalid login credentials"] };
    }
  };

  const handleLogout = (navigate) => {
    localStorage.removeItem("token");
    setUser(null);
    if (navigate) navigate("/login");
  };

  return {
    user,
    setUser,
    fetchUser,
    handleSignup,
    handleLogin,
    handleLogout
  };
}
