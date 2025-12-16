import React, { useState, useEffect } from "react";
import ShopForm from "../../components/seller/ShopForm";
import { fetchShop, createShop } from "../../api/seller/shops";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";

export default function CreateShop() {
  const { user, setUser } = useAuthContext(); // reactive user
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load existing shop on mount
  useEffect(() => {
    const loadShop = async () => {
      try {
        const existingShop = await fetchShop();
        setShop(existingShop); // null if no shop
      } catch (err) {
        console.error("Failed to load shop:", err);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, []);

  // Save new shop
  const handleSave = async (shopData) => {
    try {
      const newShop = await createShop(shopData);
      setShop(newShop);
      setUser({ ...user, shop: newShop }); // update context for Navbar & SellerNavbar
      navigate("/seller/products");
    } catch (err) {
      alert("Failed to save shop. Please try again.");
      console.error(err);
    }
  };

  const handleCancel = () => navigate("/");

  if (loading) return <div>Loading shop info...</div>;

  return (
    <div className="p-4">
      <ShopForm shop={shop} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
