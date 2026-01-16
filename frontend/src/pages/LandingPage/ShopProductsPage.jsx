import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard";
import TimeFilterBar from "../../components/TimeFilterBar";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/pages/LandingPage/ShopProductsPage.css";

export default function ShopProductsPage({
  deliveryGroups = [],
  filteredProducts = [],
  activeSlot,
  loading,
  shopId,
  onSlotChange
}) {
  const { user } = useAuthContext();

  // ----------- Special case: seller with no shop -----------
  if (user && user.role === "seller" && !shopId) {
    return (
      <div className="products-page-wrapper" style={{ textAlign: "center", padding: "2rem" }}>
        <Navbar />
        <h2>You don’t have a shop yet</h2>
        <p>Create a shop to start adding products.</p>
      </div>
    );
  }

  // ----------- Special case: user with no role -----------
  if (user && (!user.role || user.role === "none")) {
    return (
      <div className="products-page-wrapper" style={{ textAlign: "center", padding: "2rem" }}>
        <Navbar />
        <h2>Your account has no role assigned</h2>
        <p>Please contact support or complete your profile to access shop products.</p>
      </div>
    );
  }

  return (
    <div className="products-page-wrapper">
      <div className="header-filters-container">
        <Navbar />
        <div className="filters-container">
          <TimeFilterBar onChange={onSlotChange} groups={deliveryGroups} />
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            deliveryLabel={activeSlot?.label || activeSlot?.name || "Now"}
            deliveryGroupId={activeSlot?.id}
          />
        ))}
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="no-products">
          This shop has no available products for this time slot.
        </div>
      )}
    </div>
  );
}
