// Reusable time rotation helper

export const CUTOFF_MINUTES = 15;
export const REAPPEAR_HOURS = 2;

/**
 * Returns:
 *  "today"
 *  "tomorrow"
 *  "hidden"  ⛔ disappears during cutoff→+2h window
 */
export function getSlotDay(hour24) {
  const now = new Date();

  if (hour24 === -1) return "today";

  // today's slot occurrence
  const slotTime = new Date();
  slotTime.setHours(hour24, 0, 0, 0);

  const cutoffTime = new Date(slotTime.getTime() - CUTOFF_MINUTES * 60000);
  const reappearTomorrow = new Date(
    slotTime.getTime() + REAPPEAR_HOURS * 60 * 60000
  );

  // before cutoff → TODAY
  if (now < cutoffTime) return "today";

  // between cutoff and +2h → HIDDEN
  if (now >= cutoffTime && now <= reappearTomorrow) return "hidden";

  // after +2h → TOMORROW
  return "tomorrow";
}

/**
 * Converts "Now", "7am", "1pm", "6–8am" → formatted delivery phrase
 * Uses getSlotDay() rotation logic so CartPage + tickets stay in sync
 */
export function formatDeliveryLabel(rawLabel) {
  if (!rawLabel) return "delivery: unscheduled";

  const lower = rawLabel.toLowerCase();

  // 🔥 NOW case
  if (lower.includes("now")) {
    return "delivery: in 30 minutes";
  }

  // extract first hour in label
  // supports "7am", "1 pm", "6–8am", "6 - 8 pm"
  const match = rawLabel.match(/(\d{1,2})\s*(?:[-–]\s*\d{1,2})?\s*(am|pm)/i);
  if (!match) {
    return `delivery: around ${rawLabel}`;
  }

  let hour = parseInt(match[1], 10);
  const ampm = match[2].toLowerCase();

  // normalize to 24h for getSlotDay
  if (ampm === "pm" && hour !== 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;

  // 🌗 ask central time rotation logic
  const slotDayStatus = getSlotDay(hour);

  if (slotDayStatus === "today") {
    return `delivery: around ${rawLabel}`;
  }

  if (slotDayStatus === "tomorrow") {
    return `delivery: around ${rawLabel} tomorrow`;
  }

  // ⛔ hidden window — normally shouldn't show, but just in case
  return `delivery: around ${rawLabel}`;
}

/**
 * Returns sortable numeric priority for delivery labels
 * Lower number → appears earlier
 */
export function getDeliverySortScore(rawLabel) {
  if (!rawLabel) return 9999;

  const lower = rawLabel.toLowerCase();

  // 🔥 NOW comes first always
  if (lower.includes("now")) return -1000;

  // extract hour (from "7am", "6–8am", "1 pm", etc.)
  const match = rawLabel.match(/(\d{1,2})\s*(?:[-–]\s*\d{1,2})?\s*(am|pm)/i);
  if (!match) return 5000;

  let hour12 = parseInt(match[1], 10);
  const ampm = match[2].toLowerCase();

  // convert to 24h
  let hour24 = hour12;
  if (ampm === "pm" && hour12 !== 12) hour24 += 12;
  if (ampm === "am" && hour12 === 12) hour24 = 0;

  // ask rotation engine whether today/tomorrow
  const slotDay = getSlotDay(hour24);

  // map to numeric bucket
  // today morning < today afternoon < tomorrow morning < tomorrow afternoon
  let dayOffset = 0;
  if (slotDay === "tomorrow") dayOffset = 100;
  if (slotDay === "hidden") dayOffset = 999; // rarely shown

  return dayOffset + hour24;
}

