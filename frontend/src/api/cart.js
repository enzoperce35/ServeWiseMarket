import axios from "axios";

const API_BASE = "http://localhost:3000/api/v1";

/**
 * Add a product or variant to the cart
 * @param {number} productId - ID of the parent product
 * @param {number} quantity - Quantity to add (default 1)
 * @param {string} token - User auth token
 * @param {number|null} variantId - Optional variant ID
 */
export const addToCartApi = (productId, quantity = 1, token, variantId = null) => {
  const payload = { product_id: productId, quantity };
  if (variantId) payload.variant_id = variantId; // include variant if provided

  return axios.post(
    `${API_BASE}/cart_items`,
    {
      product_id: productId,
      quantity,
      variant_id: variantId, // ✅ send variant_id if any
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// ⭐ NEW — deduct stock from product (variant → mother product)
export const deductStockApi = (productId, quantity, token) => {
  return axios.post(
    `${API_BASE}/products/${productId}/deduct_stock`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
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

// ✅ Update cart item quantity
export const updateCartApi = async (cartItemId, quantity, token) => {
  const res = await axiosClient.put(`/api/v1/cart_items/${cartItemId}`, 
    { quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
