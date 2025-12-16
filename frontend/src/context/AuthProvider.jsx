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

export const useAuthContext = () => useContext(AuthContext);
