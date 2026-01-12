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

        // 1. Process groups and filter stock
        const validGroups = data
          .map(group => ({
            ...group,
            products: (group.products || []).filter(p => p && p.stock > 0)
          }))
          .filter(group => group.products.length > 0);

        setDeliveryGroups(validGroups);

        // REMOVE: setFilteredProducts(groups[0].products); 
        // We will let the TimeFilterBar trigger the first selection
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleSlotChange = (slot) => {
    if (!slot) return;
  
    // ✅ 1. Update the active slot IMMEDIATELY.
    // This ensures the ProductCard gets the label "6am" or "Now"
    setActiveSlot(slot);
  
    // ✅ 2. Handle product filtering logic
    if (slot.isNow || slot.ph_timestamp === -1) {
      const nowGroup = deliveryGroups.find(g => g.ph_timestamp === -1);
      setFilteredProducts(nowGroup?.products || []);
    } else {
      // We look for the products in our master deliveryGroups list
      const group = deliveryGroups.find((g) => g.id === slot.id);
      
      if (group) {
        setFilteredProducts(group.products);
      } else {
        // Fallback: If for some reason the group isn't found in the master list,
        // use the products already attached to the slot object from the child.
        setFilteredProducts(slot.products || []);
      }
    }
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
            deliveryLabel={activeSlot?.label || activeSlot?.name || "Loading..."} // Fallback logic
            deliveryGroupId={activeSlot?.id}
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
