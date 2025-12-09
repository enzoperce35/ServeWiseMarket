// src/pages/seller/ShopPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ProductCard from "../../components/ProductCard";
import "../../css/components/seller/ShopPage.css";

export default function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const formatAddress = (user) => {
    if (!user) return "N/A";
    const { block, lot, street, phase, community } = user;

    const blockLot = [block && `blk. ${block}`, lot && `lot ${lot}`]
      .filter(Boolean)
      .join(" - ");

    const rest = [
      street && `${street} st.`,
      phase && `${phase}`.toLowerCase(),
      community,
    ]
      .filter(Boolean)
      .join(", ");

    return [blockLot, rest].filter(Boolean).join(", ");
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

  if (loading) return <p className="user-shop-page-loading">Loading shop...</p>;
  if (errorMessage) return <p className="user-shop-page-not-found">{errorMessage}</p>;

  const generateGradientFromId = (id) => {
    if (!id) return "linear-gradient(135deg, #ccc, #aaa)";
    const hash = Array.from(String(id)).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash * 7) % 360}, 70%, 45%)`;
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  // Filter only available products (Product.stock > 0)
  const availableProducts = shop.products?.filter((p) => p.stock > 0) || [];

  return (
    <div className="user-shop-page">
      {/* Shop Header */}
      <div className="user-shop-page-header">
        <div className="user-shop-page-image-container">
          <button className="user-shop-page-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {shop.image_url ? (
            <img src={shop.image_url} alt={shop.name} className="user-shop-page-image" />
          ) : (
            <div
              className="user-shop-page-image-placeholder"
              style={{ background: generateGradientFromId(shop.id) }}
            >
              <span className="user-shop-page-image-placeholder-text">{shop.name}</span>
            </div>
          )}
        </div>

        {shop.description && (
          <p className="user-shop-page-description">{shop.description}</p>
        )}

        <p className={`user-shop-page-status ${shop.open ? "open" : "closed"}`}>
          {shop.open ? "Open" : "Closed"}
        </p>
      </div>

      {/* Products */}
      {availableProducts.length > 0 ? (
        <div className="user-shop-page-products">
          <h2 className="user-shop-page-products-header">Available</h2>
          <div className="products-grid">
            {availableProducts.map((product) => (
              <div key={product.id} className="product-card">
                <ProductCard product={product} clickable={false} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="user-shop-page-no-products">No available products at the moment.</p>
      )}

      {/* Footer: Owner Info */}
      {shop.user && (
        <footer className="user-shop-page-footer">
          <div className="user-shop-page-info">
            <p className="user-shop-page-info-item">
              <span className="user-shop-page-info-icon">📍</span>
              {formatAddress(shop.user)}
            </p>
            <p className="user-shop-page-info-item">
              <span className="user-shop-page-info-icon">📞</span>
              {shop.user.contact_number || "N/A"}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
