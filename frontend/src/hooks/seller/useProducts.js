import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import { fetchSellerProducts } from "../../api/seller/products";

export default function useProducts() {
  const { user } = useAuthContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user?.shop) {
      setProducts([]); // No shop → no products
      return;
    }

    setLoading(true);
    try {
      const data = await fetchSellerProducts(); // API call to /api/v1/seller/products
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch seller products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load products when user or shop changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Expose products and a reload function
  return { products, loading, reload: loadProducts };
}
