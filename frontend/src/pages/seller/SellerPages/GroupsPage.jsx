import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerCard from "../../../components/seller/SellerCard";
import { fetchSellerProducts } from "../../../api/seller/products";
import { fetchDeliveryGroups } from "../../../api/delivery_groups";
import { getSlotDay } from "../../../utils/deliverySlotRotation";
import "../../../css/pages/seller/SellerPages/GroupPage.css";

const formatHourLabel = (hour) => {
  if (hour === -1) return "Now";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? "pm" : "am";
  return `${h12}${ampm}`;
};

/* ================================
   SORT PRODUCTS INSIDE A GROUP
   Active → Out of Stock → Inactive
================================ */
const getSortedGroupProducts = (products, groupId) => {
  const groupProducts = products.filter((p) =>
    p.delivery_groups?.some((dg) => dg.id === groupId)
  );

  return [...groupProducts].sort((a, b) => {
    const pdgA = a.product_delivery_groups?.find(
      (dg) => dg.delivery_group_id === groupId
    );
    const pdgB = b.product_delivery_groups?.find(
      (dg) => dg.delivery_group_id === groupId
    );

    const outA = !a.stock || a.stock === 0;
    const outB = !b.stock || b.stock === 0;

    const rank = (pdg, out) => {
      if (pdg?.active) return 1; // active
      if (out) return 2;         // out of stock
      return 3;                  // inactive / not connected
    };

    return rank(pdgA, outA) - rank(pdgB, outB);
  });
};

export default function GroupsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  // Persistent Today / Tomorrow
  const [selectedDay, setSelectedDay] = useState(() => {
    return localStorage.getItem("seller_selected_day") || "today";
  });

  const [deliveryGroups, setDeliveryGroups] = useState({
    today: [],
    tomorrow: [],
  });

  const [showNoGroup, setShowNoGroup] = useState(false);

  // Per-group toggle state: true = expanded, false = collapsed
  const [expandedGroups, setExpandedGroups] = useState({});

  // Save selectedDay when changed
  useEffect(() => {
    localStorage.setItem("seller_selected_day", selectedDay);
  }, [selectedDay]);

  /* ===========================
     LOAD DATA
  =========================== */
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

        if (hour !== -1 && (hour < 6 || hour > 20)) return;

        let slot = { ...group, hour24: hour };

        if (hour === -1) {
          // "Now" pinned at top of today
          today.unshift({ ...slot, isNow: true });
          return;
        }

        const computedDay = getSlotDay(hour);

        if (computedDay === "today") today.push(slot);
        else tomorrow.push(slot);
      });

      setDeliveryGroups({ today, tomorrow });
    };

    load();
  }, []);

  /* ===========================
     HANDLE STATUS CLICK
  =========================== */
  const handleStatusClick = async (product, groupId) => {
    if (!groupId) return;

    try {
      const token = localStorage.getItem("token");

      const pdg = product.product_delivery_groups?.find(
        (dg) => dg.delivery_group_id === groupId
      );

      let updatedPdg;

      if (pdg) {
        const url = `/api/v1/product_delivery_groups/${pdg.id}/${
          pdg.active ? "deactivate" : "activate"
        }`;

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Status toggle failed: ${res.status}`);

        const data = await res.json();
        updatedPdg = data?.product_delivery_group;
        if (!updatedPdg) throw new Error("No product_delivery_group returned");
      } else {
        const res = await fetch("/api/v1/product_delivery_groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            delivery_group_id: groupId,
          }),
        });

        if (!res.ok)
          throw new Error(`Failed to add product to group: ${res.status}`);

        const data = await res.json();
        updatedPdg = data?.product_delivery_group;
        if (!updatedPdg) throw new Error("No product_delivery_group returned");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                product_delivery_groups: [
                  ...(p.product_delivery_groups?.filter(
                    (dg) => dg.id !== updatedPdg.id
                  ) || []),
                  updatedPdg,
                ],
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        `An error occurred while updating the product status: ${err.message}`
      );
    }
  };

  const handleEdit = (product) =>
    navigate(`/seller/products/${product.id}/edit`);
  const handleCreate = () => navigate("/seller/products/new");

  const productsWithNoGroup = products.filter(
    (p) => !p.delivery_groups || p.delivery_groups.length === 0
  );

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  /* ===========================
     RENDER
  =========================== */
  return (
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

      {/* ADD + NO GROUP */}
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

      {/* NO GROUP SECTION */}
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
                groupId={null}
                onStatusClick={handleStatusClick}
                onClick={() => handleEdit(product)}
              />
            ))}
          </div>
        </div>
      )}

      {/* GROUPS BY DAY */}
      {deliveryGroups[selectedDay].map((group) => {
        const groupProducts = getSortedGroupProducts(products, group.id);

        // Skip groups with no products at all
        if (groupProducts.length === 0) return null;

        // Default hidden (collapsed)
        const isExpanded = expandedGroups[group.id] ?? false;

        // Filter visible products if collapsed
        const visibleProducts = isExpanded
          ? groupProducts
          : groupProducts.filter((p) => {
              const pdg = p.product_delivery_groups?.find(
                (dg) => dg.delivery_group_id === group.id
              );
              const outOfStock = !p.stock || p.stock === 0;
              return pdg?.active && !outOfStock;
            });

        return (
          <div
            key={group.id}
            className={`delivery-group ${group.isNow ? "now" : ""}`}
          >
            <div className="delivery-group-header">
              <h3 className="delivery-group-title">
                {group.hour24 === -1
                  ? "Now"
                  : formatHourLabel(group.hour24)}
              </h3>

              {/* Toggle arrow on all groups, including "Now" */}
              <button
                className={`group-toggle-arrow ${
                  isExpanded ? "expanded" : "collapsed"
                }`}
                onClick={() => toggleGroupExpansion(group.id)}
              >
                {isExpanded ? "▲" : "▼"}
              </button>
            </div>

            <div className="seller-product-grid">
              {visibleProducts.map((product) => (
                <SellerCard
                  key={product.id}
                  product={product}
                  groupId={group.id}
                  onStatusClick={handleStatusClick}
                  onClick={() => handleEdit(product)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
