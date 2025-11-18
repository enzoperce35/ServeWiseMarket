import { createContext, useContext, useEffect } from "react";
import useAuth from "../hooks/useAuth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { user, handleSignup, handleLogin, handleLogout, fetchUser } = useAuth();

  // Load user if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signup: handleSignup,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
