// src/hooks/useAuth.jsx
import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const fetchUser = async (authToken = token) => {
    if (!authToken) return null;
  
    try {
      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      if (res.data.user) {
        const userData = {
          ...res.data.user,
          hasOngoingOrders: res.data.user.ongoing_orders_count > 0,
        };
  
        setUser(userData);
        return userData;
      }
  
      return null;
    } catch (err) {
      console.error("Fetch user failed:", err.response?.data || err.message);
      setUser(null);
      return null;
    }
  };    

  const handleLogin = async ({ contact_number, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        contact_number,
        password,
      });
  
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
  
        // ✅ pass token DIRECTLY
        await fetchUser(res.data.token);
  
        return { status: "ok" };
      }
  
      return { status: "error", errors: ["Login failed"] };
    } catch (err) {
      return {
        status: "error",
        errors: err.response?.data?.errors || ["Login failed"],
      };
    }
  };  
  
  const handleSignup = async (data) => {
    try {
      const payload = { ...data, role: "buyer" };
      const res = await axios.post(`${BASE_URL}/signup`, { user: payload });
  
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
  
      await fetchUser(res.data.token);
  
      return { status: "ok" };
    } catch (err) {
      return {
        status: "error",
        errors: err.response?.data?.errors || [err.message],
      };
    }
  };      

  const handleLogout = (navigate) => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    if (navigate) navigate("/login");
  };

  const updateShop = async (updates) => {
    const res = await axios.patch(
      `${BASE_URL}/seller/shop`,
      { shop: updates },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data?.user) setUser(res.data.user);
    return res.data;
  };

  return { user, token, setUser, fetchUser, handleLogin, handleSignup, handleLogout, updateShop };
}
