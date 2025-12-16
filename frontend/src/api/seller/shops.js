import axiosClient from "../axiosClient";

/**
 * Fetch current user's shop.
 * Returns shop object or null if no shop exists.
 */
export const fetchShop = async () => {
  try {
    const res = await axiosClient.get("/seller/shop");
    return res.data.shop || null; // shop object or null
  } catch (err) {
    console.error("Failed to fetch shop:", err);
    return null; // fallback
  }
};

/**
 * Create a new shop.
 */
export const createShop = async (shopData) => {
  try {
    const res = await axiosClient.post("/seller/shop", { shop: shopData });
    return res.data.shop;
  } catch (err) {
    console.error("Failed to create shop:", err);
    throw err;
  }
};
