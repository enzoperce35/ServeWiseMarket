import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SellerNavbar from "../../components/seller/SellerNavbar";
import SellerCard from "../../components/seller/SellerCard";

import { fetchSellerProducts } from "../../api/seller/products";
import { fetchDeliveryGroups } from "../../api/delivery_groups";

import { getSlotDay } from "../../utils/deliverySlotRotation";

import "../../css/seller/products.css";

const formatHourLabel = (hour) => {
  if (hour === -1) return "Now";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? "pm" : "am";
  return `${h12}${ampm}`;
};

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [deliveryGroups, setDeliveryGroups] = useState({ today: [], tomorrow: [] });
  const [selectedDay, setSelectedDay] = useState("today");
  const [showNoGroup, setShowNoGroup] = useState(false);

  useEffect(() => {
    const load = async () => {
      const prods = await fetchSellerProducts();
      setProducts(prods);

      const groups = await fetchDeliveryGroups();

      const today = [];
      const tomorrow = [];

      groups.forEach((group) => {
        if (!group.active) return;

        const hour = group.ph_timestamp;

        // ignore invalid time window
        if (hour !== -1 && (hour < 6 || hour > 20)) return;

        // NOW → always today section
        if (hour === -1) {
          today.unshift({ ...group, hour24: hour, isNow: true });
          return;
        }

        const slot = { ...group, hour24: hour };

        // shared helper decides today/tomorrow
        const day = getSlotDay(hour);

        if (day === "today") today.push(slot);
        else tomorrow.push(slot);
      });

      setDeliveryGroups({ today, tomorrow });
    };

    load();
  }, []);

  const handleEdit = (product) => navigate(`/seller/products/${product.id}/edit`);
  const handleCreate = () => navigate("/seller/products/new");

  const productsWithNoGroup = products.filter(
    (p) => !p.delivery_groups || p.delivery_groups.length === 0
  );

  return (
    <div className="seller-page">
      <SellerNavbar />

      <div className="seller-content">
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

        <div className="add-product-container">
          <button
            className={`no-group-btn ${showNoGroup ? "active" : ""}`}
            title="Products with no delivery group"
            onClick={() => setShowNoGroup((prev) => !prev)}
          >
            📦
          </button>
          <button className="add-product-circle" onClick={handleCreate}>
            +
          </button>
        </div>

        {showNoGroup && productsWithNoGroup.length > 0 && (
          <div className="delivery-group">
            <div className="delivery-group-header">
              <h3 className="delivery-group-title">No Group</h3>
            </div>

            <div className="seller-product-grid">
              {productsWithNoGroup.map((product) => (
                <SellerCard
                  key={product.id}
                  product={product}
                  onClick={() => handleEdit(product)}
                />
              ))}
            </div>
          </div>
        )}

        {deliveryGroups[selectedDay].map((group) => {
          const groupProducts = products.filter((p) =>
            p.delivery_groups?.some((dg) => dg.id === group.id)
          );

          if (groupProducts.length === 0) return null;

          return (
            <div key={group.id} className={`delivery-group ${group.isNow ? "now" : ""}`}>
              <div className="delivery-group-header">
                <h3 className="delivery-group-title">
                  {group.hour24 === -1 ? "Now" : formatHourLabel(group.hour24)}
                </h3>
              </div>

              <div className="seller-product-grid">
                {groupProducts.map((product) => (
                  <SellerCard
                    key={product.id}
                    product={product}
                    onClick={() => handleEdit(product)}
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
