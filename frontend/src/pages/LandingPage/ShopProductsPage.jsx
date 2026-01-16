import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard";
import TimeFilterBar from "../../components/TimeFilterBar";
import "../../css/pages/LandingPage/ShopProductsPage.css";

export default function ShopProductsPage({
  deliveryGroups,
  filteredProducts,
  activeSlot,
  loading,
  shopId,
  onSlotChange
}) {
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
