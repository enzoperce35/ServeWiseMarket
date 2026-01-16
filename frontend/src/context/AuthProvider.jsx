// AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth(); // has handleLogin, handleSignup, etc.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await auth.fetchUser();
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const handleLogin = async (form) => {
  const res = await axios.post("/api/v1/login", form);

  const { user, token } = res.data;

  setUser(user);
  setToken(token);

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return res.data; // ✅ THIS IS THE KEY
};


export const useAuthContext = () => useContext(AuthContext);
