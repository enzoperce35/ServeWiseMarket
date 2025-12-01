import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../context/AuthProvider";
import { fetchSellerProducts } from "../../api/seller/products";

export default function useProducts() {
  const { user } = useAuthContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user?.shop) {
      setProducts([]); 
      return;
    }

    setLoading(true);
    try {
      const data = await fetchSellerProducts(); 
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch seller products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // now we return setProducts so Products.jsx can update state
  return { products, loading, reload: loadProducts, setProducts };
}
