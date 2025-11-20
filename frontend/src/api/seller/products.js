import axiosClient from "../axiosClient";

// Fetch all products for the current seller
export const fetchSellerProducts = async () => {
  try {
    const response = await axiosClient.get("/seller/products");
    return response.data;
  } catch (err) {
    console.error("Error fetching seller products:", err);
    return [];
  }
};

// Create a new product
export const createProduct = async (data) => {
  try {
    const response = await axiosClient.post("/seller/products", { product: data });
    return response.data;
  } catch (err) {
    console.error("Error creating product:", err);
    throw err;
  }
};

// Update an existing product
export const updateProduct = async (id, data) => {
  try {
    const response = await axiosClient.put(`/seller/products/${id}`, { product: data });
    return response.data;
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const response = await axiosClient.delete(`/seller/products/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
};
