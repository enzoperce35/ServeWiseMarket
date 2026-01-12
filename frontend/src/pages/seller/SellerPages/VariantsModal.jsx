import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthProvider";
import { useCartContext } from "../../../context/CartProvider";
import { addToCartApi, removeFromCartApi } from "../../../api/cart";
import toast from "react-hot-toast";
import "../../../css/pages/seller/SellerPages/VariantsModal.css";

export default function VariantsModal({ product, onClose, deliveryGroupId }) {
  const { user, token } = useAuthContext();
  const { cart, refreshCart } = useCartContext();

  // Local staged quantities
  const [localQty, setLocalQty] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize local quantities from cart when opened
  useEffect(() => {
    const map = {};
    const items = cart?.shops?.flatMap(s => s.items) || [];

    product.variants.forEach(v => {
      const found = items.find(
        i => i.product_id === product.id && i.variant_id === v.id
      );
      map[v.id] = found?.quantity || 0;
    });

    setLocalQty(map);
  }, [product, cart]);

  const changeQty = (variantId, delta) => {
    setLocalQty(q => ({
      ...q,
      [variantId]: Math.max(0, (q[variantId] || 0) + delta)
    }));
  };

  // Save staged quantities to API
  const handleDone = async () => {
    if (!user || !token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setSaving(true);

      const cartItems = cart?.shops?.flatMap(s => s.items) || [];

      // For each variant compute diff
      for (const v of product.variants) {
        const currentItem = cartItems.find(
          i => i.product_id === product.id && i.variant_id === v.id
        );

        const currentQty = currentItem?.quantity || 0;
        const targetQty = localQty[v.id] || 0;

        // nothing changed
        if (currentQty === targetQty) continue;

        // becomes zero -> remove whole cart item
        if (targetQty === 0 && currentItem) {
          await removeFromCartApi(currentItem.cart_item_id, token);
          continue;
        }

        // compute diff and send addToCart with positive or negative qty
        const diff = targetQty - currentQty;
        if (diff !== 0) {
          // ✅ FIX: Pass deliveryGroupId here to prevent 422 error
          await addToCartApi(
            product.id, 
            diff, 
            token, 
            v.id, 
            deliveryGroupId
          );
        }
      }

      await refreshCart();
      toast.success("Updated tray");
      onClose();
    } catch (err) {
      console.error("Save Error:", err);
      // If the backend returns error messages, show them in toast
      const errorMsg = err.response?.data?.errors?.join(", ") || "Failed to save changes";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="variants-modal-backdrop" onClick={onClose}>
      <div className="variants-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product.name}</h2>

        <button
          className="close-btn"
          onClick={handleDone}
          disabled={saving}
        >
          {saving ? "Saving..." : "Done"}
        </button>

        <div className="variants-list">
          {product.variants.map((v) => {
            const qty = localQty[v.id] || 0;

            return (
              <div key={v.id} className="variant-row">
                {/* minus button shown only when qty > 0 */}
                <button
                  className="variant-minus-btn"
                  style={{ visibility: qty > 0 ? "visible" : "hidden" }}
                  onClick={() => changeQty(v.id, -1)}
                >
                  –
                </button>

                <div className="variant-item">
                  <div className="variant-name">
                    <span>{v.name}</span>
                  </div>

                  <span className="variant-price">
                    ₱{parseFloat(v.price ?? 0).toFixed(2)}
                  </span>

                  <span className="variant-multiplier">
                    {qty > 0 ? `×${qty}` : "\u00A0"}
                  </span>

                  <button
                    className="add-btn"
                    onClick={() => changeQty(v.id, 1)}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}