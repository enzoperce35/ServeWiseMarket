// Reusable time rotation helper

export const CUTOFF_MINUTES = 15;

/**
 * Decide whether a slot belongs to today or tomorrow
 * - hour is 0–23 or -1 for "Now"
 * - returns "today" or "tomorrow"
 */
export function getSlotDay(hour24) {
  const now = new Date();

  // "Now" stays today if active
  if (hour24 === -1) return "today";

  // Build today's slot datetime
  const slotToday = new Date();
  slotToday.setHours(hour24, 0, 0, 0);

  // cutoff = slotTime - 15 min
  const cutoff = new Date(slotToday.getTime() - CUTOFF_MINUTES * 60000);

  // If we passed cutoff, push to tomorrow
  return now >= cutoff ? "tomorrow" : "today";
}
