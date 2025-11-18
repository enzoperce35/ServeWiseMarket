// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
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

  // Fetch products from backend
  const loadProducts = async () => {
    try {
      const data = await fetchProducts(filters);
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Reload products whenever filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  return (
    <div className="products-page">
      <div className="filters-container">
        <Filters
          filters={filters}
          setFilters={setFilters}
          products={products}
        />
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="no-products">No products found</div>
        )}
      </div>
    </div>
  );
}
