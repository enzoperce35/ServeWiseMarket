import React from "react";
import { useAuthContext } from "../context/AuthProvider";

export default function ProductCard({ product }) {
  const { user } = useAuthContext();

  const addToCart = () => {
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }
    alert(`Added ${product.name} to cart!`);
  };

  // Get seller user info
  const seller = product.shop?.user;

  // Format delivery date & time
  const formattedDate = product.delivery_date
    ? new Date(product.delivery_date).toLocaleDateString()
    : "-";
  const formattedTime = product.delivery_time
    ? new Date(product.delivery_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "-";

  return (
    <div className={`product-card ${product.status ? "" : "inactive"}`} onClick={addToCart}>
      <img
        src={product.image_url || "/images/default-product.png"}
        alt={product.name}
      />

      {/* Seller Info */}
      {seller && (
        <div className="seller-info">
          <p>
            Seller: ({seller.community})
          </p>
          <p>
            CrossComm: {product.cross_comm_delivery ? "Yes" : "No"} 
            {product.cross_comm_charge ? ` (Charge: ₱${product.cross_comm_charge})` : ""}
          </p>
        </div>
      )}

      {product.category && <p>Category: {product.category}</p>}

      <div className="delivery-info">
        <p>Delivery: {formattedDate} at {formattedTime}</p>
      </div>

      {!product.status && <p className="inactive-label">Inactive</p>}
    </div>
  );
}
