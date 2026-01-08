import React, { useState, useEffect } from "react";
import SellerNavbar from "../../../components/seller/SellerNavbar";
import GroupsPage from "./GroupsPage";
import SellerProductsPage from "./SellerProductsPage";
import SellerTimesPage from "./SellerTimesPage";
import "../../../css/pages/seller/SellerPages/SellerPages.css"; // ✅ Import the CSS

export default function SellerPages() {
  // 🔹 initialize from localStorage if exists
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("seller_active_tab") || "Groups";
  });

  // 🔹 persist when it changes
  useEffect(() => {
    localStorage.setItem("seller_active_tab", activePage);
  }, [activePage]);

  return (
    <div className="seller-page-wrapper">
      {/* Navbar is shared */}
      <SellerNavbar />

      {/* Page Tabs */}
      <div className="page-tabs">
        {["Products", "Groups", "Times"].map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`page-tab-btn ${activePage === page ? "active" : ""}`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Render the active page */}
      <div className="seller-page-content">
        {activePage === "Groups" && <GroupsPage />}
        {activePage === "Products" && <SellerProductsPage />}
        {activePage === "Times" && <SellerTimesPage />}
        {/* Times page can be plugged in later */}
      </div>
    </div>
  );
}
