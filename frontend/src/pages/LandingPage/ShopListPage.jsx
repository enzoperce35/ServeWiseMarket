import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/pages/LandingPage/ShopListPage.css";

export default function ShopListPage({ shops = [], loading }) {
  const navigate = useNavigate();

  const handleShopClick = shop => {
    navigate(`/products?shop_id=${shop.id}`);
  };

  if (loading) return <p>Loading shops...</p>;

  if (!shops.length)
    return <p>No shops available at the moment. Please check back later.</p>;

  return (
    <div className="shop-list-page-wrapper">
      <h1 className="shop-list-title">Select a Shop</h1>

      <div className="shop-list-grid">
        {shops.map(shop => (
          <div
            key={shop.id}
            className="shop-card"
            onClick={() => handleShopClick(shop)}
          >
            <div className="shop-card-logo">
              {shop.name
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="shop-card-name">{shop.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
