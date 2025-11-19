import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setUser(res.data.user);
    } catch (err) {
      console.log("Fetch user failed", err);
      setUser(null); // clear user if fetch fails
    }
  };

  const handleSignup = async (data) => {
    try {
      const payload = { ...data, role: "buyer" }; // Force buyer
      const res = await axios.post(`${BASE_URL}/signup`, { user: payload });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return true; // success
    } catch (err) {
      console.log("Signup error:", err.response?.data);
      return false; // failure
    }
  };

  const handleLogin = async ({ contact_number, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { contact_number, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return true; // success
    } catch (err) {
      console.log("Login error:", err.response?.data);
      return false; // failure
    }
  };

  return { user, setUser, fetchUser, handleSignup, handleLogin };
}
