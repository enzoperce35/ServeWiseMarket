// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      await auth.fetchUser(); // fetch user including shop
      setLoading(false);
    };
    fetch();
  }, []);

  // Add updateUserShop to context
  const updateUserShop = async (updates) => {
    if (!auth.user?.shop) return;

    try {
      await auth.updateUserShop(updates); // defined in useAuth
    } catch (err) {
      console.error("Failed to update shop:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, updateUserShop, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
