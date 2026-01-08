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

  useEffect(() => {
    const loadGroups = async () => {
      const { data } = await axiosClient.get("/products");

      const groups = [];

      data.forEach((group) => {
        const products = (group.products || []).filter(
          (p) => p.stock && p.stock > 0
        );

        // ⛔ skip groups with NO products
        if (products.length === 0) return;

        groups.push({ ...group, products });
      });

      setDeliveryGroups(groups);

      // auto-select first available slot
      if (groups.length > 0) {
        setActiveSlot(groups[0]);
        setFilteredProducts(groups[0].products);
      }
    };

    loadGroups();
  }, []);

  const handleSlotChange = (slot) => {
    setActiveSlot(slot);

    const group = deliveryGroups.find((g) => g.id === slot.id);

    setFilteredProducts(
      (group?.products || []).filter((p) => p.stock && p.stock > 0)
    );
  };

  return (
    <div className="products-page-wrapper">
      <div className="header-filters-container">
        <Navbar />
        <div className="filters-container">
          <TimeFilterBar
            onChange={handleSlotChange}
            groups={deliveryGroups}   // ✅ send pre-filtered groups
          />
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
