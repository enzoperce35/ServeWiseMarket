import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCartApi } from "../api/cart";
import { useAuthContext } from "./AuthProvider";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuthContext();
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await fetchCartApi(token);
      setCart(response.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  const refreshCart = () => fetchCart(); // optional alias

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, fetchCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
