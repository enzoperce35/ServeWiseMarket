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
 * Returns a human-readable delivery label for the product
 * @param {Object} product
 * @returns {string} e.g., "Today 8am-8:30am", "Tomorrow 6pm-6:30pm", or "in 30 minutes"
 */
export const getDeliveryLabel = (product) => {
  if (!product) return "";

  if (!product.preorder_delivery) return "in 30 minutes";

  const deliveryDate = product.delivery_date ? new Date(product.delivery_date) : null;
  const deliveryTime = product.delivery_time ? new Date(product.delivery_time) : null;

  if (!deliveryDate) return "Schedule not set";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delDay = new Date(deliveryDate);
  delDay.setHours(0, 0, 0, 0);

  if (delDay < today) return "Unavailable";

  const diffDays = (delDay - today) / (1000 * 60 * 60 * 24);
  let dayLabel =
    diffDays === 0
      ? "Today"
      : diffDays === 1
      ? "Tomorrow"
      : delDay.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (!deliveryTime || deliveryTime.getHours() === 0) return dayLabel;

  const startHour = deliveryTime.getHours();
  const startMinute = deliveryTime.getMinutes();
  const endMinute = (startMinute + 30) % 60;

  const formatTime = (h, m) => {
    const ampm = h >= 12 ? "pm" : "am";
    const stdH = h % 12 || 12;
    const stdM = m > 0 ? `:${m.toString().padStart(2, "0")}` : "";
    return `${stdH}${stdM}${ampm}`;
  };

  const first = formatTime(startHour, startMinute);
  const second = formatTime(startHour, endMinute);

  return `${dayLabel} ${first}-${second}`;
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
