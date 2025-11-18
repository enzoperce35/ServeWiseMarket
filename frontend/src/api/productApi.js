// src/api/productApi.js
import axiosClient from "./axiosClient";

// filters = { category, search, minPrice, maxPrice }
export const fetchProducts = async (filters = {}) => {
  try {
    const params = {};

    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.minPrice) params.min_price = filters.minPrice;
    if (filters.maxPrice) params.max_price = filters.maxPrice;

    const response = await axiosClient.get("/products", { params });
    return response.data;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};
