import React, { useEffect, useRef, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../css/components/TimeFilterBar.css";

import { getSlotDay } from "../utils/deliverySlotRotation";

export default function TimeFilterBar({ onChange }) {
  const scrollRef = useRef(null);

  const [slots, setSlots] = useState({ today: [], tomorrow: [] });
  const [activeDay, setActiveDay] = useState("today");
  const [activeSlot, setActiveSlot] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await axiosClient.get("/delivery_groups");

        const now = new Date();
        const currentHour = now.getHours();

        const today = [];
        const tomorrow = [];

        data.forEach((group) => {
          if (!group.active || !group.products || group.products.length === 0)
            return;

          const hour = group.ph_timestamp;

          // --- SPECIAL CASE: "Now" slot ---
          if (hour === -1) {
            // hide Now after 7pm as you wanted
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

          // -------- USE 15-MIN ROTATION HELPER HERE ----------
          const computedDay = getSlotDay(hour);

          const slot = {
            ...group,
            label: group.name,
            hour24: hour,
            day: computedDay,
          };

          if (computedDay === "today") {
            today.push(slot);
          } else {
            tomorrow.push(slot);
          }
        });

        setSlots({ today, tomorrow });

        // auto-select first slot only once
        if (!initialized) {
          const firstSlot = today[0] || tomorrow[0];
          if (firstSlot) {
            setActiveSlot(firstSlot.label);
            setActiveDay(firstSlot.day);
            onChange?.(firstSlot);
            setInitialized(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch delivery groups:", err);
      }
    };

    fetchSlots();
  }, [onChange, initialized]);

  const selectSlot = (slot) => {
    setActiveSlot(slot.label);
    setActiveDay(slot.day);
    onChange?.(slot);
  };

  const jumpToDay = (day) => {
    const el = scrollRef.current;
    const target = el?.querySelector(`[data-day="${day}"]`);
    if (target) {
      el.scrollTo({ left: target.offsetLeft - 16, behavior: "smooth" });
    }
    setActiveDay(day);
  };

  return (
    <div className="time-filter-bar">
      <div className="day-switch">
        {["today", "tomorrow"].map((day) => (
          <span
            key={day}
            className={activeDay === day ? "active" : ""}
            onClick={() => jumpToDay(day)}
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
                  <TimeChip
                    key={slot.id}
                    slot={slot}
                    activeSlot={activeSlot}
                    onClick={selectSlot}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeChip({ slot, activeSlot, onClick }) {
  return (
    <div
      className={`time-chip ${activeSlot === slot.label ? "selected" : ""}`}
      onClick={() => onClick(slot)}
    >
      {slot.label}
    </div>
  );
}
