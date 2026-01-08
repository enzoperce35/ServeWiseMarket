import React, { useEffect, useRef, useState } from "react";
import "../css/components/TimeFilterBar.css";
import { getSlotDay } from "../utils/deliverySlotRotation";

export default function TimeFilterBar({ onChange, groups = [] }) {
  const scrollRef = useRef(null);

  const [slots, setSlots] = useState({ today: [], tomorrow: [] });
  const [activeDay, setActiveDay] = useState("today");
  const [activeSlot, setActiveSlot] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();

    const today = [];
    const tomorrow = [];

    groups.forEach((group) => {
      // ⛔ hide slots that ended up with ZERO products
      if (!group.products || group.products.length === 0) return;

      const hour = group.ph_timestamp;

      if (hour === -1) {
        if (currentHour >= 6 && currentHour <= 18) {
          today.unshift({
            ...group,
            label: "Now",
            hour24: currentHour,
            day: "today",
            isNow: true,
          });
        }
        return;
      }

      const computedDay = getSlotDay(hour);

      const slot = {
        ...group,
        label: group.name,
        hour24: hour,
        day: computedDay,
      };

      if (computedDay === "today") today.push(slot);
      else tomorrow.push(slot);
    });

    setSlots({ today, tomorrow });

    // auto-select first visible slot
    if (!initialized) {
      const first = today[0] || tomorrow[0];
      if (first) {
        setActiveSlot(first.label);
        setActiveDay(first.day);
        onChange?.(first);
        setInitialized(true);
      }
    }
  }, [groups, onChange, initialized]);

  const selectSlot = (slot) => {
    setActiveSlot(slot.label);
    setActiveDay(slot.day);
    onChange?.(slot);
  };

  return (
    <div className="time-filter-bar">
      <div className="day-switch">
        {["today", "tomorrow"].map((day) => (
          <span
            key={day}
            className={activeDay === day ? "active" : ""}
            onClick={() => setActiveDay(day)}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </span>
        ))}
      </div>

      <div className="time-carousel" ref={scrollRef}>
        {["today", "tomorrow"].map((day) => {
          if (!slots[day] || slots[day].length === 0) return null;

          return (
            <div className="day-group" key={day} data-day={day}>
              <div className="day-label">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </div>

              <div className="slots-row">
                {slots[day].map((slot) => (
                  <div
                    key={slot.id}
                    className={`time-chip ${
                      activeSlot === slot.label ? "selected" : ""
                    }`}
                    onClick={() => selectSlot(slot)}
                  >
                    {slot.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
