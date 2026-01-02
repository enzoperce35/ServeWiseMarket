import React, { useEffect, useState } from "react";
import { getDeliveryLabel, isOutOfStock } from "../../utils/deliveryDateTime";
import "../../css/components/seller/SellerCard.css";

export default function SellerCard({ product, user, onClick, onStatusClick }) {
  const [status, setStatus] = useState(Boolean(product.status));

  const price = Number(product.price || 0);
  const imageUrl = product.image_url || "/images/default-product.png";
  const stock = product.stock ?? 0;
  const nextAvailable = product.next_available_date || "N/A";

  useEffect(() => {
    setStatus(Boolean(product.status));
  }, [product.status]);

  const deliveryLabel = getDeliveryLabel(product);

  const getStatusColor = () => {
    if (!status) return "#ccc";
    if (status && product.preorder_delivery) return "orange";
    return "green";
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    const newStatus = !status;
    setStatus(newStatus);
    onStatusClick?.({ ...product, status: newStatus });
  };

  const shortenCommunity = (community) => {
    if (community === "Sampaguita Homes") return "Homes";
    if (community === "Sampaguita West") return "West";
    return community || "Unknown";
  };

  const userCommunity = shortenCommunity(user?.community);
  const otherCommunity = userCommunity === "Homes" ? "West" : "Homes";

  const getCheckIcon = (community) => {
    if (!user?.community) return "❌";
    if (product.cross_comm_delivery) return "✅";
    return community === userCommunity ? "✅" : "❌";
  };

  // Only grey out and hide status dot for out-of-stock products
  const outOfStock = isOutOfStock(product);

  return (
    <div
      className={`seller-product-card clickable-card ${
        product.preorder_delivery ? "instant-card" : "preorder-card"
      } ${outOfStock ? "out-of-stock-product" : ""}`}
      onClick={onClick}
    >
      <div className="seller-product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="seller-product-img" />

        {/* Hide status dot for out-of-stock only */}
        {!outOfStock && (
          <span className="status-dot-wrapper" onClick={handleStatusClick}>
            <span
              className="status-dot"
              style={{ backgroundColor: getStatusColor() }}
              title={`Status: ${
                !status
                  ? "Inactive"
                  : product.delivery_date || product.delivery_time
                  ? "Scheduled"
                  : "Active"
              }`}
            />
          </span>
        )}
      </div>

      <div className="seller-product-name">
        <h3>{product.name}</h3>

        <div className="price-stock-container">
          <p className="price-stock">
            <strong>Price:</strong> ₱{price.toFixed(2)}
          </p>
          
          <p className="price-stock" style={{ color: stock <= 0 ? "red" : "inherit" }}>
            <strong>Stock:</strong> {stock}
          </p>

          {/* Mobile/tablet community checks */}
          {window.innerWidth <= 768 && user?.community && (
            <div className="community-checks-inline">
              <span>
                <strong>
                  {otherCommunity}: {getCheckIcon(otherCommunity) === "✅" ? "Yes" : "No"}
                </strong>
              </span>
            </div>
          )}
        </div>

        {product.availability_type === "pre_order" && (
          <p>
            <strong>Next Available:</strong> {nextAvailable}
          </p>
        )}

        <div className="bottom-row">
          <p className="delivery-label">
            <span>Deliver:</span>
            <br />
            <span className="delivery-date">{deliveryLabel}</span>
          </p>

          {user?.community && (
            <div className="community-checks">
              <span>
                {userCommunity} {getCheckIcon(userCommunity)}
              </span>
              <span>
                {otherCommunity} {getCheckIcon(otherCommunity)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
