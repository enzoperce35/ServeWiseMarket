import React, { useState, useEffect } from "react";
import ShopForm from "../../components/seller/ShopForm";
import { createShop, fetchShop } from "../../api/seller/shops";
import { useNavigate } from "react-router-dom";

export default function CreateShop() {
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadShop = async () => {
      const existingShop = await fetchShop();
      if (existingShop) {
        setShop(existingShop);
      }
    };
    loadShop();
  }, []);

  const handleSave = async (shopData) => {
    try {
      await createShop(shopData);
      navigate("/seller/products"); // redirect to seller dashboard
    } catch (err) {
      console.error("Failed to save shop:", err);
    }
  };

  const handleCancel = () => {
    navigate("/"); // go back to homepage
  };

  return (
    <div className="p-4">
      <ShopForm shop={shop} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
