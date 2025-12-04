import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import axiosClient from "../api/axiosClient";
import { getDeliveryLabel } from "../utils/deliveryDateTime";
import { isOwner, getPriceString } from "../utils/userProducts";
import "../css/pages/ProductPage.css";

export default function ProductPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const pRes = await axiosClient.get(`/products/${id}`);
        setProduct(pRes.data);

        // Fetch ratings
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

  const addToCart = () => {
    if (!user) {
      alert("Please log in to add items to tray.");
      return;
    }
    alert(`Added ${product.name} to tray!`);
  };

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
      : null;

  return (
    <div className="product-page">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <img
        className="product-page-image"
        src={product.image_url || "/images/default-product.png"}
        alt={product.name}
      />

      <div className="product-page-content">
        <h1 className="product-title">{product.name}</h1>

        {/* Visit Shop button */}
        {!isOwner(user, product) && (
          <button
            className="shop-link-btn"
            onClick={() => navigate("/seller/shop")}
          >
            Visit {product.shop?.name}
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

          {averageRating && (
            <p className="average-rating">
              ⭐ Average Rating: <strong>{averageRating}</strong> ({ratings.length} review
              {ratings.length > 1 ? "s" : ""})
            </p>
          )}
        </div>

        {/* Add to Tray */}
        {!isOwner(user, product) && (
          <button className="add-to-tray-btn" onClick={addToCart}>
            Add to Tray
          </button>
        )}

        {/* Individual Ratings */}
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
