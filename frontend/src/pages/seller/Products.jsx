import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import useProducts from "../../hooks/seller/useProducts";
import { useAuthContext } from "../../context/AuthProvider";

import SellerCard from "../../components/seller/SellerCard";
import SellerNavbar from "../../components/seller/SellerNavbar";

import { updateProduct } from "../../api/seller/products";

import "../../css/seller/products.css";

/* ================================
   TIME CONFIG
================================ */
const HOURS_24 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const BUFFER_HOURS = 2;

/* ================================
   HELPERS
================================ */
const formatHourLabel = (hour) => {
  if (hour === "Now") return "Now";

  const h = Number(hour);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "pm" : "am";

  return `${hour12}${ampm}`;
};

export default function Products() {
  const { products, loading: productsLoading, setProducts } = useProducts();
  const { user, loading: userLoading } = useAuthContext();
  const navigate = useNavigate();

  /* ================================
     DAY SELECTION
  ================================ */
  const [selectedDay, setSelectedDay] = useState("today");

  /* ================================
     BUILD TIME GROUPS
  ================================ */
  const buildHourGroups = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const minHourToday = currentHour + BUFFER_HOURS;

    const today = ["Now"];
    const tomorrow = [];

    HOURS_24.forEach((hour) => {
      if (hour >= minHourToday) {
        today.push(hour);
      } else {
        tomorrow.push(hour);
      }
    });

    return { today, tomorrow };
  };

  const hourGroups = buildHourGroups();

  /* ================================
     NAVIGATION
  ================================ */
  const handleEdit = (product) =>
    navigate(`/seller/products/${product.id}/edit`);

  const handleCreate = () => navigate("/seller/products/new");

  /* ================================
     ADD/REMOVE DELIVERY TIME
  ================================ */
  const handleAddDeliveryTime = async (product, hour) => {
    const resolvedHour = hour === "Now" ? -1 : Number(hour);

    const alreadyExists = (product.delivery_times || []).some(
      (slot) => Number(slot.hour) === resolvedHour
    );

    let updatedDeliveryTimes;
    if (alreadyExists) {
      // Remove the hour
      updatedDeliveryTimes = (product.delivery_times || []).filter(
        (slot) => Number(slot.hour) !== resolvedHour
      );
    } else {
      // Add the hour
      updatedDeliveryTimes = [
        ...(product.delivery_times || []),
        { hour: resolvedHour },
      ];
    }

    try {
      const updatedProduct = await updateProduct(product.id, {
        delivery_times: updatedDeliveryTimes,
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    } catch (err) {
      console.error("Failed to update delivery time:", err);
    }
  };

  /* ================================
     LOADING / EMPTY STATES
  ================================ */
  if (productsLoading || userLoading) {
    return <p>Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="seller-page">
        <SellerNavbar />
        <div className="seller-content">
          <div className="no-products-message">
            <p>
              You have no products yet. Click the button below to create your
              first product!
            </p>
            <button className="add-product-button" onClick={handleCreate}>
              + Create Product
            </button>
          </div>
        </div>
      </div>
    );
  }
  console.log(products)
  /* ================================
     RENDER
  ================================ */
  return (
    <div className="seller-page">
      <SellerNavbar />

      <div className="seller-content">
        {/* DAY TOGGLE */}
        <div className="day-toggle">
          {["today", "tomorrow"].map((day) => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>

        {/* Big green + below toggle */}
        <div className="add-product-container">
          <button className="add-product-circle" onClick={handleCreate}>
            +
          </button>
        </div>

        {/* DELIVERY GROUPS */}
        {hourGroups[selectedDay].map((hour, idx) => {
          const resolvedHour = hour === "Now" ? -1 : Number(hour);

          return (
            <div key={`${hour}-${idx}`} className="delivery-group">
              <div className="delivery-group-header">
                <h3 className="delivery-group-title">
                  {hour === "Now"
                    ? "Now"
                    : `${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} ${formatHourLabel(hour)}`}
                </h3>
              </div>

              <div className="seller-product-grid">
                {products.map((product) => (
                  <SellerCard
                    key={product.id}
                    product={product}
                    onClick={() => handleEdit(product)}
                    onStatusClick={(updatedProduct) =>
                      handleAddDeliveryTime(product, hour)
                    }
                    deliveryHour={resolvedHour}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
