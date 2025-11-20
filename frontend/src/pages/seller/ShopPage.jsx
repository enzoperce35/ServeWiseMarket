// src/pages/seller/ShopPage.jsx
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopForm from "../../components/seller/ShopForm";
import { useAuthContext } from "../../context/AuthProvider";

export default function ShopPage() {
  const { currentUser } = useContext(useAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate("/login"); // redirect if not logged in
  }, [currentUser, navigate]);

  const handleSave = (shop) => {
    // After creating/updating shop, go to products page
    navigate("/seller/products");
  };

  return (
    <div className="seller-page p-4">
      <h2 className="mb-4">
        {currentUser?.shop ? "Edit Your Shop" : "Create Your Shop"}
      </h2>
      <ShopForm onSave={handleSave} />
    </div>
  );
}
