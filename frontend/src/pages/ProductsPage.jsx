import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import "../css/pages/ProductsPage.css";
import { fetchProducts } from "../api/productApi";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
    });
  }, []);

  return (
    <div className="products-page">
      <div className="filters-container">
        <Filters
          products={products}
          setFilteredProducts={setFilteredProducts}
        />
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-products">No products found.</p>
        )}
      </div>
    </div>
  );
}
