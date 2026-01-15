import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthProvider";
import { useCartContext } from "../../../context/CartProvider";
import { addToCartApi, removeFromCartApi } from "../../../api/cart";
import toast from "react-hot-toast";
import "../../../css/pages/seller/SellerPages/VariantsModal.css";

export default function VariantsModal({ product, onClose, deliveryGroupId }) {
  const { user, token: userToken } = useAuthContext();
  const { cart, refreshCart } = useCartContext();

  const [localQty, setLocalQty] = useState({});
  const [saving, setSaving] = useState(false);

  // Helper for guest or logged-in token
  const getToken = () => {
    if (userToken) return userToken;
    let token = localStorage.getItem("guest_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("guest_token", token);
    }
    return token;
  };

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

  const handleDone = async () => {
    try {
      setSaving(true);

      const token = getToken();
      const cartItems = cart?.shops?.flatMap(s => s.items) || [];

      for (const v of product.variants) {
        const currentItem = cartItems.find(
          i => i.product_id === product.id && i.variant_id === v.id
        );

        const currentQty = currentItem?.quantity || 0;
        const targetQty = localQty[v.id] || 0;

        if (currentQty === targetQty) continue;

        // Remove if quantity is zero
        if (targetQty === 0 && currentItem) {
          await removeFromCartApi(currentItem.cart_item_id, token);
          continue;
        }

        // Compute diff and call addToCartApi
        const diff = targetQty - currentQty;
        if (diff !== 0) {
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
      const errorMsg =
        err.response?.data?.errors?.join(", ") || "Failed to save changes";
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
