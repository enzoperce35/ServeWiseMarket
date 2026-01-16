import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuthContext } from "../../context/AuthProvider";

import ShopListPage from "./ShopListPage";
import ShopProductsPage from "./ShopProductsPage";

export default function LandingPage() {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();

  const view = searchParams.get("view"); // ?view=shops

  const rawShopId = searchParams.get("shop_id");
  const urlShopId =
    rawShopId && rawShopId !== "null" && rawShopId !== "undefined"
      ? rawShopId
      : null;

  const userShopId = user?.shop?.id || null;
  const shopId = urlShopId || userShopId;

  const [shops, setShops] = useState([]);
  const [deliveryGroups, setDeliveryGroups] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----------- Load shops (ONLY when view=shops) -----------
  useEffect(() => {
    if (view !== "shops") return;

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
  }, [view]);

  // ----------- Load products for shop -----------
  useEffect(() => {
    if (!shopId || view === "shops") return;

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
          setFilteredProducts(data[0].products || []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [shopId, view]);

  const handleSlotChange = slot => {
    if (!slot) return;
    setActiveSlot(slot);
    setFilteredProducts(slot.products || []);
  };

  // ----------- Render -----------

  // Explicit shops view
  if (view === "shops") {
    return <ShopListPage shops={shops} loading={loading} />;
  }

  // Default → shop products
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
