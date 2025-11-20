import axiosClient from "../axiosClient";

export const fetchShop = async () => {
  try {
    const res = await axiosClient.get("/seller/shop");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch shop:", err);
    return null;
  }
};

export const createShop = async (shopData) => {
  try {
    const res = await axiosClient.post("/seller/shop", shopData);
    return res.data;
  } catch (err) {
    console.error("Failed to create shop:", err);
    throw err;
  }
};
