import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthProvider";
import { useCartContext } from "../../../context/CartProvider";
import { addToCartApi, removeFromCartApi } from "../../../api/cart";
import toast from "react-hot-toast";
import "../../../css/pages/seller/SellerPages/VariantsModal.css";

export default function VariantsModal({ product, onClose }) {
  const { user, token } = useAuthContext();
  const { cart, refreshCart } = useCartContext();
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
      await refreshCart();
    } catch {
      toast.error("Failed to add variant");
    } finally {
      setLoadingVariant(null);
    }
  };

  const decreaseVariant = async (variant) => {
    if (!user || !token) return;

    const allItems = cart?.shops?.flatMap(s => s.items) || [];
    const item = allItems.find(i => i.product_id === product.id && i.variant_id === variant.id);

    if (!item) return;

    try {
      if (item.quantity <= 1) {
        await removeFromCartApi(item.cart_item_id, token);
      } else {
        await addToCartApi(product.id, -1, token, variant.id); // negative qty to decrease
      }
      await refreshCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="variants-modal-backdrop" onClick={onClose}>
      <div className="variants-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product.name}</h2>
        <button className="close-btn" onClick={onClose}>done</button>

        {product.variants.map((v) => {
          const qty = getVariantQuantity(v.id);

          return (
            <div key={v.id} className="variant-row">
              {/* Minus button always present in DOM for alignment, hidden if qty === 0 */}
              <button
                className="variant-minus-btn"
                style={{ visibility: qty > 0 ? "visible" : "hidden" }}
                onClick={async () => {
                  if (qty === 0) return;

                  try {
                    const cartItem = cart.shops
                      .flatMap((s) => s.items)
                      .find(
                        (i) => i.product_id === product.id && i.variant_id === v.id
                      );
                    if (!cartItem) return;

                    await removeFromCartApi(cartItem.cart_item_id, token);
                    await refreshCart();
                  } catch {
                    toast.error("Failed to remove item");
                  }
                }}
              >
                –
              </button>

              <div className="variant-item">
                {/* Variant name */}
                <div className="variant-name">
                  <span>{v.name}</span>
                </div>

                {/* Variant price */}
                <span className="variant-price">
                  ₱{parseFloat(v.price ?? 0).toFixed(2)}
                </span>

                {/* Multiplier / placeholder */}
                <span className="variant-multiplier">
                  {qty > 0 ? `×${qty}` : "\u00A0"}
                </span>

                {/* Add button */}
                <button
                  className="add-btn"
                  onClick={() => addVariantToCart(v)}
                  disabled={loadingVariant === v.id}
                >
                  {loadingVariant === v.id ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
