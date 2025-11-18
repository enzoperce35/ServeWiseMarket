// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import "../css/pages/ProductsPage.css";
import { fetchProducts } from "../api/productApi";
import { useAuthContext } from "../context/AuthContext";

export default function ProductsPage() {
  const { user } = useAuthContext();

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minPrice: "",
    maxPrice: ""
  });

  // Load products from backend
  const loadProducts = async () => {
    const data = await fetchProducts(filters);
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  return (
    <div className="products-page">
      <Filters filters={filters} setFilters={setFilters} products={products} />

      {/* If logged in, show greeting */}
      {user && (
        <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
          Welcome back, {user.name}!
        </p>
      )}

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="no-products">No products found.</p>
        )}
      </div>
    </div>
  );
}
