import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCartApi } from "../api/cart";
import { useAuthContext } from "./AuthProvider";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuthContext();
  // Ensure default state is always an object
  const [cart, setCart] = useState({ shops: [], item_count: 0 });

  const fetchCart = async () => {
    try {
      const response = await fetchCartApi(token);
      const data = response.data;

      // Ensure we have a valid shops array even if API returns something unexpected
      const shops = data?.shops || [];
      
      const item_count = shops.reduce((acc, shop) => {
        return acc + (shop.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);
      }, 0) || 0;

      setCart({ ...data, shops, item_count });
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      // 🔥 CRITICAL: Reset to empty object, NOT null
      setCart({ shops: [], item_count: 0 });
    }
  };

  // refreshCart should usually trigger a re-fetch to sync with DB
  const refreshCart = () => fetchCart();

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, setCart, fetchCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};