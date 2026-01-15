import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { addToCartApi } from "../api/cart";
import { isOwner } from "../utils/userProducts";
import toast from "react-hot-toast";
import "../css/components/ProductCard.css";
import VariantsModal from "../pages/seller/SellerPages/VariantsModal";

export default function ProductCard({
  product,
  clickable = true,
  deliveryLabel,
  deliveryGroupId
}) {
  if (!product) return null;

  const navigate = useNavigate();
  const { user, token: userToken } = useAuthContext();
  const { refreshCart } = useCartContext();

  const [loading, setLoading] = useState(false);
  const [showVariants, setShowVariants] = useState(false);

  const status = product.status ?? true;
  const preorder = product.preorder_delivery ?? false;
  const variants = product.variants ?? [];

  const handleCardClick = () => {
    if (clickable) navigate(`/product/${product.id}`);
  };

  const getDeliveryDetail = (label) => {
    if (!label) return "";
    if (label.toLowerCase() === "now") return "Delivery: in 30 minutes";
    return `Delivery: around ${label}`;
  };

  // 🔹 Get token: user or guest
  const getToken = () => {
    if (userToken) return userToken;
    let token = localStorage.getItem("guest_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("guest_token", token);
    }
    return token;
  };

  // 🔹 MAIN add-to-cart button
  const addToCart = async (e, quantity = 1) => {
    e.stopPropagation();

    const activeVariants = variants.filter(v => v.active !== false);
    if (activeVariants.length > 0) {
      setShowVariants(true);
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const token = getToken();

      await addToCartApi(
        product.id,
        quantity,
        token,
        null,               // variantId null for main product
        deliveryGroupId     // pass delivery group
      );

      await refreshCart();
      toast.success("Added to tray");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Add variant to cart
  const addVariantToCart = async (variantId, quantity = 1) => {
    if (loading) return;

    try {
      setLoading(true);

      const token = getToken();

      await addToCartApi(
        product.id,
        quantity,
        token,
        variantId,          // pass selected variant
        deliveryGroupId     // pass delivery group
      );

      await refreshCart();
      toast.success("Added to tray");
      setShowVariants(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add variant");
    } finally {
      setLoading(false);
    }
  };

  const getPriceString = (product) => {
    const basePrice = parseFloat(product.price ?? 0);
    return `₱${basePrice.toFixed(2)}`;
  };

  return (
    <>
      <div
        className={`product-card ${status ? "" : "inactive"} ${preorder ? "preorder" : "regular"}`}
        onClick={handleCardClick}
        style={{ cursor: clickable ? "pointer" : "default" }}
      >
        <img
          src={product.image_url || "/images/default-product.png"}
          alt={product.name}
        />

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>

          {deliveryLabel && (
            <p className="delivery-detail-text">
              {getDeliveryDetail(deliveryLabel)}
            </p>
          )}
        </div>

        <p className="product-price-label">{getPriceString(product)}</p>

        {!isOwner(user, product) && (
          <button
            className="add-to-cart"
            onClick={addToCart}
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            {loading ? "Adding..." : "Add to Tray"}
          </button>
        )}
      </div>

      {showVariants && (
        <VariantsModal
          product={{ ...product, variants: variants.filter(v => v.active !== false) }}
          onClose={() => setShowVariants(false)}
          onVariantAdd={addVariantToCart}
          deliveryGroupId={deliveryGroupId}
        />
      )}
    </>
  );
}
