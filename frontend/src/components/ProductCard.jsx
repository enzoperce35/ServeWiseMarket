import React from "react";
import { useAuthContext } from "../context/AuthProvider";
import { getDeliveryLabel } from "../utils/deliveryDateTime";
import "../css/components/ProductCard.css";

export default function ProductCard({ product }) {
  const { user } = useAuthContext();

  const addToCart = () => {
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }
    alert(`Added ${product.name} to cart!`);
  };

  const deliveryDisplay = getDeliveryLabel(product);

  // Price adjustment if cross community + has charge
  let crossCommCharge = 0;
  let finalPrice = product.price;

  if (
    product.cross_comm_delivery &&
    product.cross_comm_charge > 0 &&
    user?.community !== product.shop?.user?.community
  ) {
    crossCommCharge = product.cross_comm_charge;
    finalPrice = parseFloat(product.price) + parseFloat(crossCommCharge);
  }

  const isMyProduct =
    user?.contact_number === product.shop?.user?.contact_number;

  return (
    <div
      className={`product-card 
      ${product.status ? "" : "inactive"} 
      ${product.preorder_delivery ? "regular" : "preorder"}
     `}
     onClick={!isMyProduct ? addToCart : undefined}
    >

      <img src={product.image_url || "/images/default-product.png"} alt={product.name} />

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {deliveryDisplay && (
          <p className="delivery">
            Delivery: <span className="delivery-time">{deliveryDisplay}</span>
          </p>
        )}

        <p className="product-price">
          ₱{product.price}
          {crossCommCharge > 0 && (
            <span className="delivery-charge">
              {" + ₱" + crossCommCharge + " delivery charge"}
              {product.shop?.user?.community && (
                <> ({product.shop.user.community.split(" ").slice(-1)[0]})</>
              )}
            </span>
          )}
        </p>
      </div>

      {/* 🔥 Hide Add to Cart if it's the user's own product */}
      {!isMyProduct && (
        <button className="add-to-cart" onClick={addToCart}>
          Add to Tray
        </button>
      )}

      {!product.status && <p className="inactive-label">Inactive</p>}
    </div>
  );
}
