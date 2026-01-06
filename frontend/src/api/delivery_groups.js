import axiosClient from "./axiosClient"; // your axios instance

export const fetchDeliveryGroups = async () => {
  try {
    const res = await axiosClient.get("/delivery_groups"); // <- remove the extra /api/v1
    return res.data;
  } catch (err) {
    console.error("Failed to fetch delivery groups:", err);
    throw err;
  }
};
