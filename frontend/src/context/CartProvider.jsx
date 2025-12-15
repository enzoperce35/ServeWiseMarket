import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchCartApi, addToCartApi, removeFromCartApi } from "../api/cart";
import { useAuthContext } from "./AuthProvider";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuthContext(); // ✅ token comes from AuthProvider
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Fetch cart
  // ---------------------------
  const refreshCart = async () => {
    if (!user || !token) {
      setCart(null);
      return;
    }

    try {
      const res = await fetchCartApi(token);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCart(null);
    }
  };

  // ---------------------------
  // Add to cart
  // ---------------------------
  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      await addToCartApi(productId, quantity, token); // ✅ TOKEN PASSED
      await refreshCart(); // ✅ sync cart after mutation
    } catch (err) {
      console.error("Add to cart failed:", err);
      throw err;
    }
  };

  // ---------------------------
  // Remove from cart
  // ---------------------------
  const removeFromCart = async (cartItemId) => {
    if (!token) return;

    try {
      await removeFromCartApi(cartItemId, token);
      await refreshCart();
    } catch (err) {
      console.error("Remove from cart failed:", err);
    }
  };

  // Auto-load cart on login
  useEffect(() => {
    refreshCart();
  }, [user, token]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
