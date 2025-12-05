import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { getDeliveryLabel } from "../utils/deliveryDateTime";
import { isOwner, getPriceString } from "../utils/userProducts";
import "../css/components/ProductCard.css";

export default function ProductCard({ product, clickable = true }) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const addToCart = (e) => {
    e.stopPropagation(); // prevent card click redirect
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }
    alert(`Added ${product.name} to cart!`);
  };

  const deliveryDisplay = getDeliveryLabel(product);
  const priceString = getPriceString(product, user);

  const handleCardClick = () => {
    if (clickable) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div
      className={`product-card 
        ${product.status ? "" : "inactive"} 
        ${product.preorder_delivery ? "regular" : "preorder"}
      `}
      onClick={handleCardClick}
      style={{ cursor: clickable ? "pointer" : "default" }} // change cursor if not clickable
    >
      <img
        src={product.image_url || "/images/default-product.png"}
        alt={product.name}
      />

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {deliveryDisplay && (
          <p className="delivery">
            Delivery: <span className="delivery-time">{deliveryDisplay}</span>
          </p>
        )}

        <p className="product-price">{priceString}</p>
      </div>

      {/* Hide Add to Tray if owner */}
      {!isOwner(user, product) && (
        <button className="add-to-cart" onClick={addToCart}>
          Add to Tray
        </button>
      )}

      {!product.status && <p className="inactive-label">Inactive</p>}
    </div>
  );
}
