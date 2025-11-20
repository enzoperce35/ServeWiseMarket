import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export default function useAuth() {
  const [user, setUser] = useState(null);

  // Fetch current logged-in user if token exists
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // res.data should include user + shop
      setUser(res.data.user); 
      return { status: "ok", user: res.data.user };
    } catch (err) {
      console.error("Fetch user failed:", err.response?.data || err.message);
      setUser(null);
      return { status: "error", errors: ["Failed to fetch user"] };
    }
  };

  // Signup (force buyer role)
  const handleSignup = async (data) => {
    try {
      const payload = { ...data, role: "buyer" }; 
      const res = await axios.post(`${BASE_URL}/signup`, { user: payload });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user); // will not have shop yet

      return { status: "ok" };
    } catch (err) {
      return {
        status: "error",
        errors: err.response?.data?.errors || [err.message || "Signup failed"]
      };
    }
  };

  // Login
  const handleLogin = async ({ contact_number, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        contact_number,
        password
      });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user); // include shop if exists

      return { status: "ok" };
    } catch (err) {
      return {
        status: "error",
        errors: err.response?.data?.errors || ["Invalid login credentials"]
      };
    }
  };

  // Logout
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
