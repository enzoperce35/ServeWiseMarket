// src/utils/deliveryDate.js

/**
 * Returns a JavaScript Date object representing the combined delivery date and time.
 * @param {Object} product - The product object containing delivery_date and optionally delivery_time
 * @returns {Date|null} - Combined delivery Date object or null if delivery_date is missing
 */
export const getDeliveryDateTime = (product) => {
  if (!product?.delivery_date) return null;

  // Extract date components
  const [year, month, day] = product.delivery_date
    .split("T")[0]
    .split("-")
    .map(Number);

  // Default time
  let hours = 0, minutes = 0, seconds = 0;

  if (product.delivery_time) {
    const time = new Date(product.delivery_time);
    hours = time.getHours();
    minutes = time.getMinutes();
    seconds = time.getSeconds();
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
};


/**
 * Check if a preorder delivery product is expired
 * @param {Object} product
 * @returns {boolean}
 */
export const isExpired = (product) => {
  const combinedDate = getDeliveryDateTime(product);
  if (!combinedDate) return false; // delivery_date missing

  return new Date() > combinedDate;
};
