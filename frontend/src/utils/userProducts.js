// src/utils/checkOwnership.js

/**
 * Check if the logged-in user owns the product.
 * 
 * @param {Object} user - current logged in user (can be null)
 * @param {Object} product - product object from API
 * @returns {boolean} true if user owns the product
 */
// src/utils/checkOwnership.js

export const isOwner = (user, product) => {
  if (!user || !product || !product.shop || !product.shop.user) return false;

  return user.id === product.shop.user.id;
};


/**
 * Returns a full formatted price string.
 * Examples:
 *  - "₱75.00"
 *  - "₱75.00 + ₱20.00 delivery charge (West)"
 */
export const getPriceString = (product, user) => {
  const basePrice = parseFloat(product.price ?? 0);
  const baseStr = `₱${basePrice.toFixed(2)}`;

  const isCross =
    product.cross_comm_delivery &&
    product.cross_comm_charge > 0 &&
    user?.community !== product.shop?.user?.community;

  if (!isCross) {
    return baseStr; // no additional charge
  }

  const charge = parseFloat(product.cross_comm_charge);
  const chargeStr = `₱${charge.toFixed(2)}`;

  // Extract last word of community name (e.g., "West", "East", "NCR")
  const community = product.shop?.user?.community || "";
  const shortCommunity = community.split(" ").slice(-1)[0];

  return `${baseStr} + ${chargeStr} delivery charge (${shortCommunity})`;
};

  