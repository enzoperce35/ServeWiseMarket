import React, { useEffect, useRef, useState } from "react";
import "../css/components/TimeFilterBar.css";
import { getSlotDay } from "../utils/deliverySlotRotation";

export default function TimeFilterBar({ onChange, groups = [] }) {
  const scrollRef = useRef(null);

  const [slots, setSlots] = useState({ today: [], tomorrow: [] });
  const [activeSlot, setActiveSlot] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();

    const today = [];
    const tomorrow = [];

    groups.forEach((group) => {
      if (!group.products || group.products.length === 0) return;

      const hour = group.ph_timestamp;

      // NOW slot
      if (hour === -1) {
        if (currentHour >= 6 && currentHour <= 18) {
          today.unshift({
            ...group,
            label: "Now",
            hour24: currentHour,
            isNow: true,
            day: "today",
          });
        }
        return;
      }

      const computedDay = getSlotDay(hour);

      // hidden window
      if (computedDay === "hidden") return;

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

    // auto select first available
    if (!initialized) {
      const first = today[0] || tomorrow[0];
      if (first) {
        setActiveSlot(first.label);
        onChange?.(first);
        setInitialized(true);
      }
    }
  }, [groups, onChange, initialized]);

  const selectSlot = (slot) => {
    setActiveSlot(slot.label);
    onChange?.(slot);
  };

  return (
    <div className="time-filter-bar">
      <div className="time-carousel" ref={scrollRef}>
        
        {/* Today group */}
        {slots.today.length > 0 && (
          <div className="day-group" data-day="today">
            <div className="day-label">Today</div>

            <div className="slots-row">
              {slots.today.map((slot) => (
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
        )}

        {/* Tomorrow group */}
        {slots.tomorrow.length > 0 && (
          <div className="day-group" data-day="tomorrow">
            <div className="day-label">Tomorrow</div>

            <div className="slots-row">
              {slots.tomorrow.map((slot) => (
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
        )}
      </div>
    </div>
  );
}
