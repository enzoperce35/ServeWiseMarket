import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { addToCartApi } from "../api/cart";
import axiosClient from "../api/axiosClient";
import { getDeliveryLabel } from "../utils/deliveryDateTime";
import { isOwner, getPriceString } from "../utils/userProducts";
import BackButton from "../components/common/BackButton";
import toast from "react-hot-toast";
import "../css/pages/ProductPage.css";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, token } = useAuthContext();
  const { refreshCart } = useCartContext();

  const [product, setProduct] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false); // ✅ prevent double add

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const pRes = await axiosClient.get(`/products/${id}`);
        setProduct(pRes.data);

        const rRes = await axiosClient.get(`/products/${id}/ratings`);
        setRatings(rRes.data || []);
      } catch (err) {
        console.error("Failed to load product or ratings", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  const deliveryDisplay = getDeliveryLabel(product);
  const priceString = getPriceString(product, user);

  // ✅ REAL add to tray
  const handleAddToCart = async () => {
    if (!user || !token) {
      toast.error("Please log in to add items to tray");
      return;
    }
  
    if (adding) return;
    setAdding(true);
  
    try {
      await addToCartApi(product.id, 1, token);
      await refreshCart();
  
      toast.success(
        (t) => (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span>Added to tray</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate("/cart");
              }}
              style={{
                background: "#ff7a00",
                color: "#fff",
                border: "none",
                padding: "4px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Check Tray
            </button>
          </div>
        ),
        {
          duration: 2000, // ✅ THIS is the missing piece
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item");
    } finally {
      setAdding(false);
    }
  };  

  const shopId = product.shop_id || product.shop?.id;

  return (
    <div className="product-page">
     <BackButton className="back-btn" />

      <img
        className="product-page-image"
        src={product.image_url || "/images/default-product.png"}
        alt={product.name}
      />

      <div className="product-page-content">
        <h1 className="product-title">{product.name}</h1>

        {!isOwner(user, product) && shopId && (
          <button
            className="shop-link-btn"
            onClick={() => navigate(`/shop/${shopId}`)}
          >
            Visit Shop
          </button>
        )}

        <p className="product-description">{product.description}</p>

        <div className="product-meta">
          <p className="price">
            <strong>{priceString}</strong>
          </p>
          <p className="stock">
            Stock: <strong>{product.stock}</strong>
          </p>
          <p className="delivery">
            Delivery: <span>{deliveryDisplay}</span>
          </p>

          {ratings.length > 0 && (
            <p className="average-rating">
              ⭐ Average Rating:{" "}
              <strong>
                {(
                  ratings.reduce((acc, r) => acc + r.rating, 0) /
                  ratings.length
                ).toFixed(1)}
              </strong>{" "}
              ({ratings.length} review{ratings.length > 1 ? "s" : ""})
            </p>
          )}
        </div>

        {/* ✅ Add to Tray */}
        {!isOwner(user, product) && (
          <button
          className="add-to-tray-btn"
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? "Adding..." : "Add to Tray"}
        </button>        
        )}

        {ratings.length > 0 && (
          <div className="ratings-section">
            <h2 className="reviews-header">Reviews</h2>
            {ratings.map((r) => (
              <div key={r.id} className="rating-item">
                <p className="rating-user">
                  {r.user?.name || "Anonymous"} - ⭐ {r.rating}
                </p>
                <p className="rating-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
