import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const fetchUser = async () => {
    try {
      if (!token) {
        setUser(null);
        return null;
      }

      const res = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error("Fetch user failed:", err.response?.data || err.message);
      setUser(null);
      return null;
    }
  };

  const handleSignup = async (data) => {
    try {
      const payload = { ...data, role: "buyer" };
      const res = await axios.post(`${BASE_URL}/signup`, { user: payload });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token); // ✅ store in state
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
      setToken(res.data.token); // ✅ store in state
      const freshUser = await fetchUser();
      return { status: "ok", user: freshUser };
    } catch {
      return { status: "error", errors: ["Invalid login credentials"] };
    }
  };

  const handleLogout = (navigate) => {
    localStorage.removeItem("token");
    setToken(null); // ✅ clear token
    setUser(null);
    if (navigate) navigate("/login");
  };

  const updateShop = async (updates) => {
    const res = await axios.patch(
      `${BASE_URL}/seller/shop`,
      { shop: updates },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  
    if (res.data?.user) {
      setUser(res.data.user);
    }
  
    return res.data;
  };     

  return {
    user,
    token, // ✅ expose token
    setUser,
    fetchUser,
    handleSignup,
    handleLogin,
    handleLogout,
    updateShop,
  };
}
