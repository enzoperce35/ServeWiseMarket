// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import "../css/pages/ProductsPage.css";
import { fetchProducts } from "../api/productApi";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
  });

  const loadProducts = async () => {
    const data = await fetchProducts(filters);
    setProducts(data);
    setFilteredProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  return (
    <div className="products-page-wrapper">
      {/* Navbar + Filters Container */}
      <div className="header-filters-container">
        <Navbar />
        <div className="filters-container">
          <Filters filters={filters} setFilters={setFilters} products={products} />
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
