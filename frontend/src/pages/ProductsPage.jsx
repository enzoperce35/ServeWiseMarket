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
  const [loading, setLoading] = useState(true);

  // Load products with variants
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const { data } = await axiosClient.get("/products?include=variants");
        const groups = [];

        data.forEach((group) => {
          // Only include products with stock > 0
          const products = (group.products || []).filter(
            (p) => p && p.stock > 0
          );

          if (products.length === 0) return;

          const productsWithVariants = products.map((p) => ({
            ...p,
            variants: p.variants ?? [],
          }));

          groups.push({ ...group, products: productsWithVariants });
        });

        setDeliveryGroups(groups);

        if (groups.length > 0) {
          setActiveSlot(groups[0]);
          setFilteredProducts(groups[0].products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleSlotChange = (slot) => {
    setActiveSlot(slot);

    const group = deliveryGroups.find((g) => g.id === slot.id);

    // Only include products with stock > 0
    setFilteredProducts((group?.products || []).filter((p) => p && p.stock > 0));
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="products-page-wrapper">
      <div className="header-filters-container">
        <Navbar />
        <div className="filters-container">
          <TimeFilterBar onChange={handleSlotChange} groups={deliveryGroups} />
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            deliveryLabel={activeSlot?.name} // 📌 Pass the time slot name here
            deliveryGroupId={activeSlot?.id} // NEW — send actual group ID
          />
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
