import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import "../css/pages/ProductsPage.css";
import { fetchProducts } from "../api/productApi";
import { useAuthContext } from "../context/AuthProvider";

export default function ProductsPage() {
  const { user, loading } = useAuthContext(); // user can be null — allowed
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
      setFilteredProducts(data);
    };
    loadProducts();
  }, []);

  // Wait for auth check — prevents flicker
  if (loading) return <div>Loading...</div>;

  return (
    <div className="products-page-wrapper">
      {/* Navbar & Filters */}
      <div className="header-filters-container">
        <Navbar />
        <div className="filters-container">
          <Filters
            products={products}
            setFilteredProducts={setFilteredProducts}
            user={user} // 🟢 may be NULL — fine
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {filteredProducts.length === 0 && (
          <div className="no-products">No products found.</div>
        )}
      </div>
    </div>
  );
}
