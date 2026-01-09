import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthProvider";
import { addToCartApi } from "../../../api/cart";
import toast from "react-hot-toast";
import "../../../css/pages/seller/SellerPages/VariantsModal.css";

export default function VariantsModal({ product, onClose, refreshCart }) {
  const { user, token } = useAuthContext();
  const [loadingVariant, setLoadingVariant] = useState(null);

  const addVariantToCart = async (variantId) => {
    if (!user || !token) {
      toast.error("Please log in to add items to tray");
      return;
    }

    try {
      setLoadingVariant(variantId);
      await addToCartApi(variantId, 1, token);
      await refreshCart();
      toast.success("Variant added to tray");
    } catch {
      toast.error("Failed to add variant");
    } finally {
      setLoadingVariant(null);
    }
  };

  return (
    <div className="variants-modal-backdrop" onClick={onClose}>
      <div className="variants-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Select Variant for {product.name}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
        {product.variants.length === 0 ? (
          <p>No variants available.</p>
        ) : (
          <div className="variants-list">
            {product.variants.map((v) => (
              <div key={v.id} className="variant-item">
                <span>{v.name}</span>
                <span>₱{parseFloat(v.price ?? 0).toFixed(2)}</span>
                <button
                  onClick={() => addVariantToCart(v.id)}
                  disabled={loadingVariant === v.id}
                >
                  {loadingVariant === v.id ? "Adding..." : "Add"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
