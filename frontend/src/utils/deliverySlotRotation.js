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
