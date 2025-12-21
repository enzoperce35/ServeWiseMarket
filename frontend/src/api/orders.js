// src/api/orders.js
import axiosClient from "./axiosClient";

export const checkoutApi = (token) => {
  return axiosClient.post(
    "/orders",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// ✅ ADD THIS
export const fetchOrdersApi = (token) => {
  return axiosClient.get("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
