import axiosClient from "./axiosClient";

export async function fetchProducts() {
  const response = await axiosClient.get("/products");
  return response.data;
}
