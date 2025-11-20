import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import ShopForm from "../../components/seller/ShopForm";
import "../../css/seller/seller.css";

export default function ShopSettings() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Fetch shop info
  const fetchShop = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/seller/shop");
      setShop(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  // Save updates
  const handleSave = async (data) => {
    try {
      await axiosClient.put("/seller/shop", { shop: data });
      setEditing(false);
      fetchShop();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!shop) return <p>No shop found. Please contact support.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Shop Settings</h2>

      {!editing ? (
        <div className="seller-product-card">
          {shop.image_url && (
            <img src={shop.image_url} alt={shop.name} className="seller-product-img" />
          )}
          <h3 className="seller-product-title">{shop.name}</h3>
          <p className="seller-product-info">
            Status: {shop.open ? "Open" : "Closed"}
          </p>
          <button
            className="seller-btn seller-btn-warning mt-2"
            onClick={() => setEditing(true)}
          >
            Edit Shop
          </button>
        </div>
      ) : (
        <ShopForm shop={shop} onSave={handleSave} onCancel={() => setEditing(false)} />
      )}
    </div>
  );
}
