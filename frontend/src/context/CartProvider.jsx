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
      const data = response.data;

      // Calculate total item count for badge
      const item_count = data?.shops?.reduce((acc, shop) => {
        return acc + (shop.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);
      }, 0) || 0;

      setCart({ ...data, item_count }); // <-- add item_count
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  const refreshCart = () => fetchCart();

  React.useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, fetchCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
