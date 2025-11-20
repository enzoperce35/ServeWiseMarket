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

  return (
    <AuthContext.Provider value={{ ...auth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
