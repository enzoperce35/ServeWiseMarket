// src/utils/deliveryDateTime.js

/**
 * Returns a JavaScript Date object representing the combined delivery date and time
 * in local time.
 * @param {Object} product - { delivery_date: "YYYY-MM-DD", delivery_time: "HH:mm" }
 * @returns {Date|null} - Date object or null if delivery_date missing
 */
export const getDeliveryDateTime = (product) => {
  if (!product?.delivery_date) return null;

  const [year, month, day] = product.delivery_date.split("T")[0].split("-").map(Number);

  let hours = 0, minutes = 0, seconds = 0;

  if (product.delivery_time) {
    const [h, m] = product.delivery_time.split(":").map(Number);
    hours = h || 0;
    minutes = m || 0;
  }

  // Construct date in local time
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
 * Returns true if a product's delivery datetime has passed.
 * @param {Object} product
 * @returns {boolean}
 */
export const isExpired = (product) => {
  const combinedDate = getDeliveryDateTime(product);
  if (!combinedDate) return false;

  const now = new Date();
  return now.getTime() > combinedDate.getTime();
}
