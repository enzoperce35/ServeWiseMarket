import { createContext, useContext, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    auth.fetchUser(); // fetch logged-in user on mount
  }, []);

  // Provide all auth functions and user state
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
