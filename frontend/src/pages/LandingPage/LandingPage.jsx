import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuthContext } from "../../context/AuthProvider";

import ShopListPage from "./ShopListPage";
import ShopProductsPage from "./ShopProductsPage";

export default function LandingPage() {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();

  const rawShopId = searchParams.get("shop_id");
  const urlShopId =
    rawShopId && rawShopId !== "null" && rawShopId !== "undefined"
      ? rawShopId
      : null;

  const userShopId = user?.shop?.id || null;
  const shopId = urlShopId || userShopId;

  // States
  const [shops, setShops] = useState([]);
  const [deliveryGroups, setDeliveryGroups] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------- Load shops (guest users only) -----------
  useEffect(() => {
    if (shopId || user) return;

    const loadShops = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get("/shops");
        setShops(data || []);
      } catch (err) {
        console.error("Failed to load shops:", err);
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, [shopId, user]);

  // ----------- Load products for shop -----------
  useEffect(() => {
    if (!shopId) return;

    const loadProducts = async () => {
      setLoading(true);
      setDeliveryGroups([]);
      setFilteredProducts([]);
      setActiveSlot(null);

      try {
        const { data } = await axiosClient.get(
          `/products?include=variants&shop_id=${shopId}`
        );

        setDeliveryGroups(data);

        if (data.length > 0) {
          setActiveSlot(data[0]);
          setFilteredProducts(data[0].products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [shopId]);

  // ----------- Handle time slot changes -----------
  const handleSlotChange = slot => {
    if (!slot) return;
    setActiveSlot(slot);
    setFilteredProducts(slot.products || []);
  };

  // ----------- Logged-in but NO shop -----------
  if (user && !shopId) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>You don’t have a shop yet</h2>
        <p>Create a shop to start adding products.</p>
      </div>
    );
  }

  // ----------- Guest users -----------
  if (!shopId) {
    return <ShopListPage shops={shops} loading={loading} />;
  }

  // ----------- Shop products -----------
  return (
    <ShopProductsPage
      deliveryGroups={deliveryGroups}
      filteredProducts={filteredProducts}
      activeSlot={activeSlot}
      loading={loading}
      shopId={shopId}
      onSlotChange={handleSlotChange}
    />
  );
}
