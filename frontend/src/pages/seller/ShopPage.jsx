// src/pages/seller/ShopPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "../../css/components/seller/ShopPage.css";

export default function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Format full address
  const formatAddress = (user) => {
    if (!user) return "N/A";
    const { block, lot, street, phase, community } = user;
    return [block, lot, street, phase, community].filter(Boolean).join(", ");
  };

  useEffect(() => {
    const loadShop = async () => {
      try {
        const res = await axiosClient.get(`/shops/${shopId}`);
        if (!res.data?.shop) {
          setErrorMessage("Shop not found");
          return;
        }
        setShop(res.data.shop);
      } catch (err) {
        console.error("Failed to load shop:", err);
        setErrorMessage("Shop not found");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  if (loading) return <p className="loading">Loading shop...</p>;
  if (errorMessage) return <p className="not-found">{errorMessage}</p>;

  return (
    <div className="shop-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Shop Header */}
      <div className="shop-header">
        {shop.image_url && (
          <img src={shop.image_url} alt={shop.name} className="shop-image" />
        )}
        <h1 className="shop-title">{shop.name}</h1>
        {shop.description && <p className="shop-description">{shop.description}</p>}
        <p className={`shop-status ${shop.open ? "open" : "closed"}`}>
          {shop.open ? "Open" : "Closed"}
        </p>
      </div>

      {/* Owner Info */}
      {shop.user && (
        <div className="shop-owner-info">
          <h2>Owner Information</h2>
          <p><strong>Name:</strong> {shop.user.name}</p>
          <p><strong>Contact:</strong> {shop.user.contact_number || "N/A"}</p>
          <p><strong>Address:</strong> {formatAddress(shop.user)}</p>
        </div>
      )}

      {/* Products */}
      {shop.products?.length > 0 ? (
        <div className="shop-products">
          <h2>Products</h2>
          <div className="products-grid">
            {shop.products.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={product.image_url || "/images/default-product.png"}
                  alt={product.name}
                  className="product-image"
                />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₱{Number(product.price).toFixed(2)}</p>
                <p className={`product-status ${product.status ? "available" : "unavailable"}`}>
                  {product.status ? "Available" : "Unavailable"}
                </p>
                {product.featured && <span className="featured-badge">Featured</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="no-products">No products listed yet.</p>
      )}
    </div>
  );
}
