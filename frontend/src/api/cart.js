import axios from "axios";

const API_BASE = "http://localhost:3000/api/v1";

/**
 * Get the token to use for API requests:
 * - Use logged-in user's token if available
 * - Otherwise, generate/use a persistent guest token
 */
const getToken = (token) => {
  if (token) return token; // logged-in user

  let guestToken = localStorage.getItem("guest_token");
  if (!guestToken) {
    guestToken = crypto.randomUUID(); // modern unique ID
    localStorage.setItem("guest_token", guestToken);
  }
  return guestToken;
};

/**
 * Add a product or variant to the cart
 * @param {number} productId
 * @param {number} quantity
 * @param {string|null} token - user token or null for guest
 * @param {number|null} variantId
 * @param {number|null} deliveryGroupId
 */
export const addToCartApi = (
  productId,
  quantity = 1,
  token = null,
  variantId = null,
  deliveryGroupId = null
) => {
  const payload = { product_id: productId, quantity };

  if (variantId) payload.variant_id = variantId;
  if (deliveryGroupId) payload.delivery_group_id = deliveryGroupId;

  const headers = {};
  const apiToken = getToken(token);
  if (apiToken) headers["X-Guest-Token"] = apiToken;
  if (token) headers["Authorization"] = `Bearer ${token}`; // include if logged in

  return axios.post(`${API_BASE}/cart_items`, payload, { headers });
};

// Deduct stock
export const deductStockApi = (productId, quantity, token = null) => {
  const headers = {};
  const apiToken = getToken(token);
  if (apiToken) headers["X-Guest-Token"] = apiToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return axios.post(
    `${API_BASE}/products/${productId}/deduct_stock`,
    { quantity },
    { headers }
  );
};

// Fetch cart
export const fetchCartApi = (token = null) => {
  const headers = {};
  const apiToken = getToken(token);
  if (apiToken) headers["X-Guest-Token"] = apiToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return axios.get(`${API_BASE}/cart`, { headers });
};

// Remove from cart
export const removeFromCartApi = (cartItemId, token = null) => {
  const headers = {};
  const apiToken = getToken(token);
  if (apiToken) headers["X-Guest-Token"] = apiToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return axios.delete(`${API_BASE}/cart_items/${cartItemId}`, { headers });
};

// Update cart item quantity
export const updateCartApi = async (cartItemId, quantity, token = null) => {
  const headers = {};
  const apiToken = getToken(token);
  if (apiToken) headers["X-Guest-Token"] = apiToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await axios.put(
    `${API_BASE}/cart_items/${cartItemId}`,
    { quantity },
    { headers }
  );
  return res.data;
};

export const checkoutCartApi = (token = null) => {
  const headers = {};
  const apiToken = getToken(token);
  if (apiToken) headers["X-Guest-Token"] = apiToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return axios.post(`${API_BASE}/cart/checkout`, {}, { headers });
};

