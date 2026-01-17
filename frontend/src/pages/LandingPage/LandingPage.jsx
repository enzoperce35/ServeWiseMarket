import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuthContext } from "../../context/AuthProvider";
import { useCartContext } from "../../context/CartProvider";

import ShopListPage from "./ShopListPage";
import ShopProductsPage from "./ShopProductsPage";

export default function LandingPage() {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();

  const view = searchParams.get("view");
  const rawShopId = searchParams.get("shop_id");

  const urlShopId =
    rawShopId && rawShopId !== "null" && rawShopId !== "undefined"
      ? Number(rawShopId)
      : null;

  const userShopId = user?.shop?.id || null;
  const shopId = urlShopId || userShopId;

  const {
    setActiveShopId,
    setCart
  } = useCartContext();

  const [shops, setShops] = useState([]);
  const [deliveryGroups, setDeliveryGroups] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ HARD SET ACTIVE SHOP (EARLY + AUTHORITATIVE)
  useEffect(() => {
    if (!shopId) return;

    setActiveShopId(shopId);

    // 🔥 HARD RESET cart view when switching shops
    setCart((prev) => {
      const shop = prev.shops?.find(
        (s) => s.shop_id === shopId
      );

      return {
        ...prev,
        shops: shop ? [shop] : [],
        item_count: shop
          ? shop.items.reduce(
              (sum, i) => sum + Number(i.quantity || 0),
              0
            )
          : 0
      };
    });
  }, [shopId]);

  // ----------- Load shops -----------
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

  // ----------- Load products -----------
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

  const handleSlotChange = (slot) => {
    if (!slot) return;
    setActiveSlot(slot);
    setFilteredProducts(slot.products || []);
  };

  if (view === "shops") {
    return <ShopListPage shops={shops} loading={loading} />;
  }

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

