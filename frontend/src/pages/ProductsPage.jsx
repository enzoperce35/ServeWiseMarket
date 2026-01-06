import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import TimeFilterBar from "../components/TimeFilterBar";
import axiosClient from "../api/axiosClient";
import "../css/pages/ProductsPage.css";

export default function ProductsPage() {
  const [deliveryGroups, setDeliveryGroups] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);

  // 1️⃣ Fetch delivery groups
  useEffect(() => {
    const loadGroups = async () => {
      const { data } = await axiosClient.get("/delivery_groups");
      setDeliveryGroups(data);

      // 2️⃣ Automatically select "Now" if it exists
      const nowSlot = data.find((g) => g.ph_timestamp === -1); // Now has ph_timestamp = -1
      if (nowSlot) {
        setActiveSlot(nowSlot);
        setFilteredProducts(nowSlot.products || []);
      } else if (data.length > 0) {
        // fallback: first slot
        setActiveSlot(data[0]);
        setFilteredProducts(data[0].products || []);
      }
    };

    loadGroups();
  }, []);

  // 3️⃣ When user clicks a slot in TimeFilterBar
  const handleSlotChange = (slot) => {
    setActiveSlot(slot);
    const group = deliveryGroups.find((g) => g.id === slot.id);
    setFilteredProducts(group?.products || []);
  };

  return (
    <div className="products-page-wrapper">
      <div className="header-filters-container">
        <Navbar />
        <div className="filters-container">
          <TimeFilterBar onChange={handleSlotChange} />
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {filteredProducts.length === 0 && (
          <div className="no-products">
            No products available for this time slot.
          </div>
        )}
      </div>
    </div>
  );
}
