// ===============================================================
// ⭐ GENERAL TIME PARSER — safely handles HH:mm, HH:mm:ss, AM/PM, timestamps
// ===============================================================
const parseTime = (timeStr) => {
  if (!timeStr) return { hours: 0, minutes: 0 };

  let t = timeStr.trim();

  // Case: full timestamp "2025-12-10T08:30:00Z"
  if (t.includes("T")) {
    const d = new Date(t);
    if (!isNaN(d)) return { hours: d.getHours(), minutes: d.getMinutes() };
  }

  // AM/PM
  const isPM = /pm$/i.test(t);
  const isAM = /am$/i.test(t);
  t = t.replace(/am|pm/i, "").trim();

  // Replace "." → ":" (e.g. "8.30")
  t = t.replace(".", ":");

  const [h, m] = t.split(":").map(Number);
  let hours = h || 0;
  let minutes = m || 0;

  // AM/PM adjust
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return { hours, minutes };
};

// ===============================================================
// ⭐ NEW HELPER: Combined Delivery Date + Time
// ===============================================================
export const getDeliveryDateTime = (product, addDays = 0) => {
  if (!product?.delivery_date) return null;

  // Extract date
  const [year, month, day] = product.delivery_date.split("T")[0]
    .split("-")
    .map(Number);

  // Extract time
  const { hours, minutes } = parseTime(product.delivery_time);

  const d = new Date(year, month - 1, day, hours, minutes, 0);

  if (addDays !== 0) d.setDate(d.getDate() + addDays);

  return d;
};


// ===============================================================
// LABEL (unchanged, still readable)
// ===============================================================
export const getDeliveryLabel = (product) => {
  if (!product) return "";
  if (!product.preorder_delivery) return "in 30 minutes";

  const fullDate = getDeliveryDateTime(product);
  if (!fullDate) return "Schedule not set";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delDay = new Date(fullDate);
  delDay.setHours(0, 0, 0, 0);

  if (delDay < today) return "Unavailable";

  const diffDays = (delDay - today) / 86400000;

  const dayLabel =
    diffDays === 0
      ? "Today"
      : diffDays === 1
      ? "Tomorrow"
      : delDay.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

  const startHour = fullDate.getHours();
  const startMinute = fullDate.getMinutes();
  const endMinute = (startMinute + 30) % 60;

  const formatTime = (h, m) => {
    const ampm = h >= 12 ? "pm" : "am";
    const stdH = h % 12 || 12;
    const stdM = m ? `:${m.toString().padStart(2, "0")}` : "";
    return `${stdH}${stdM}${ampm}`;
  };

  const first = formatTime(startHour, startMinute);
  const second = formatTime(startHour, endMinute);

  return `${dayLabel} ${first}-${second}`;
};

// ===============================================================
// EXPIRY CHECK (cleaner now)
// ===============================================================
export const isExpired = (product) => {
  const date = getDeliveryDateTime(product);
  if (!date) return false;

  return Date.now() > date.getTime();
};
