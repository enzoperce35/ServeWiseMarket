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
      const { data } = await axiosClient.get("/products"); // ✅ fetch products filtered by active product_delivery_group

      // Group products by their delivery group and filter out-of-stock products
      const groupsMap = {};
      data.forEach((group) => {
        const products = (group.products || []).filter(
          (p) => p.stock && p.stock > 0 // ✅ only include products in stock
        );
        if (products.length === 0) return; // skip empty groups
        groupsMap[group.id] = { ...group, products };
      });
      const groupsArray = Object.values(groupsMap);
      setDeliveryGroups(groupsArray);

      // Auto-select "Now" if exists
      const nowSlot = groupsArray.find((g) => g.ph_timestamp === -1);
      if (nowSlot) {
        setActiveSlot(nowSlot);
        setFilteredProducts(nowSlot.products);
      } else if (groupsArray.length > 0) {
        setActiveSlot(groupsArray[0]);
        setFilteredProducts(groupsArray[0].products);
      }
    };
    loadGroups();
  }, []);

  const handleSlotChange = (slot) => {
    setActiveSlot(slot);
    const group = deliveryGroups.find((g) => g.id === slot.id);
    setFilteredProducts(
      (group?.products || []).filter((p) => p.stock && p.stock > 0) // ✅ filter out-of-stock again
    );
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
