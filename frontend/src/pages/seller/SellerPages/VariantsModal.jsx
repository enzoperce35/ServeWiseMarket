import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthProvider";
import { useCartContext } from "../../../context/CartProvider";
import { addToCartApi } from "../../../api/cart";
import toast from "react-hot-toast";
import "../../../css/pages/seller/SellerPages/VariantsModal.css";

export default function VariantsModal({ product, onClose }) {
  const { user, token } = useAuthContext();
  const { cart, refreshCart } = useCartContext(); // <-- subscribe to cart context
  const [loadingVariant, setLoadingVariant] = useState(null);

  // Get current quantity of this variant in the cart
  const getVariantQuantity = (variantId) => {
    if (!cart) return 0;
    const allItems = cart.shops?.flatMap((shop) => shop.items) || [];
    const item = allItems.find(
      (i) => i.product_id === product.id && i.variant_id === variantId
    );
    return item?.quantity || 0;
  };

  const addVariantToCart = async (variant) => {
    if (!user || !token) {
      toast.error("Please log in to add items to tray");
      return;
    }

    try {
      setLoadingVariant(variant.id);
      await addToCartApi(product.id, 1, token, variant.id);
      await refreshCart(); // triggers a re-render with updated cart
      toast.success(`${variant.name} added to tray`);
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
            {product.variants.map((v) => {
              const qty = getVariantQuantity(v.id);
              return (
                <div key={v.id} className="variant-item">
                  {/* Variant name */}
                  <div className="variant-name">
                    <span>{v.name}</span>
                  </div>

                  {/* Variant price */}
                  <span className="variant-price">₱{parseFloat(v.price ?? 0).toFixed(2)}</span>

                  {/* Multiplier / placeholder */}
                  <span className="variant-multiplier">
                    {qty > 0 ? `×${qty}` : "\u00A0" /* non-breaking space */}
                  </span>

                  {/* Add button */}
                  <button
                    onClick={() => addVariantToCart(v)}
                    disabled={loadingVariant === v.id}
                  >
                    {loadingVariant === v.id ? "Adding..." : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
