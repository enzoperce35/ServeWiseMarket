// src/pages/seller/Products.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useProducts from "../../hooks/seller/useProducts";
import ProductCard from "../../components/seller/ProductCard";
import "../../css/seller/seller.css";

export default function Products() {
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  const handleEdit = (product) => {
    navigate(`/seller/products/${product.id}/edit`);
  };

  const handleCreate = () => {
    navigate("/seller/products/new");
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="p-4 seller-page">
      {products.length === 0 ? (
        <div className="no-products-message">
          <p>You have no products yet. Click the button below to create your first product!</p>
          <button className="add-product-button" onClick={handleCreate}>
            + Create Product
          </button>
        </div>
      ) : (
        <div className="seller-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleEdit(product)}
            />
          ))}

          {/* Floating + button (optional if you still want it for existing products) */}
          <button
            className="add-product-circle"
            onClick={handleCreate}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
