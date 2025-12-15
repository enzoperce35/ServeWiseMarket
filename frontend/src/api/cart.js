import axios from "axios";

const API_BASE = "http://localhost:3000/api/v1";

// Add a product to the cart
export const addToCartApi = (productId, quantity = 1, token) => {
  return axios.post(
    `${API_BASE}/cart_items`,
    { product_id: productId, quantity }, // <-- send quantity correctly
    {
      headers: {
        Authorization: `Bearer ${token}`, // <-- token in header
      },
    }
  );
};

// Fetch cart
export const fetchCartApi = (token) => {
  return axios.get(`${API_BASE}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Remove from cart
export const removeFromCartApi = (cartItemId, token) => {
  return axios.delete(`${API_BASE}/cart_items/${cartItemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
