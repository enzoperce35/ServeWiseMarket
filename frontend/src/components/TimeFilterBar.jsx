import React, { useEffect, useRef, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../css/components/TimeFilterBar.css";

const BUFFER_HOURS = 2;

export default function TimeFilterBar({ onChange }) {
  const scrollRef = useRef(null);

  const [slots, setSlots] = useState({ today: [], tomorrow: [] });
  const [activeDay, setActiveDay] = useState("today");
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    buildSlotsFromBackend();
  }, []);

  const buildSlotsFromBackend = async () => {
    const { data } = await axiosClient.get("/delivery_groups");

    const now = new Date();
    const currentHour = now.getHours();
    const minHour = currentHour + BUFFER_HOURS;

    const today = [];
    const tomorrow = [];

    data.forEach((group) => {
      const hour = group.ph_timestamp;

      // 🚫 Ignore inactive or out-of-range slots
      if (!group.active) return;
      if (hour !== -1 && (hour < 6 || hour > 20)) return;

      // ⏱ NOW
      if (hour === -1) {
        if (currentHour >= 6 && currentHour <= 20) {
          today.unshift({
            id: group.id,
            label: "Now",
            hour24: currentHour,
            day: "today",
            isNow: true,
          });
        }
        return;
      }

      const slot = {
        id: group.id,
        label: group.name,
        hour24: hour,
      };

      // TODAY vs TOMORROW (same logic as before)
      if (hour >= minHour) {
        today.push({ ...slot, day: "today" });
      } else {
        tomorrow.push({ ...slot, day: "tomorrow" });
      }
    });

    setSlots({ today, tomorrow });

    // 🎯 Auto-select first valid slot
    const initial = today[0] || tomorrow[0];
    if (initial) {
      setActiveSlot(initial.label);
      setActiveDay(initial.day);
      onChange?.(initial);
    }
  };

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
      {/* DAY TABS */}
      <div className="day-switch">
        <span
          className={activeDay === "today" ? "active" : ""}
          onClick={() => jumpToDay("today")}
        >
          Today
        </span>
        <span
          className={activeDay === "tomorrow" ? "active" : ""}
          onClick={() => jumpToDay("tomorrow")}
        >
          Tomorrow
        </span>
      </div>

      {/* TIME CAROUSEL */}
      <div className="time-carousel" ref={scrollRef}>
        {slots.today.length > 0 && (
          <div className="day-group" data-day="today">
            <div className="day-label">Today</div>
            {slots.today.map((slot) => (
              <TimeChip
                key={`t-${slot.id}`}
                slot={slot}
                activeSlot={activeSlot}
                onClick={selectSlot}
              />
            ))}
          </div>
        )}

        {slots.tomorrow.length > 0 && (
          <div className="day-group" data-day="tomorrow">
            <div className="day-label">Tomorrow</div>
            {slots.tomorrow.map((slot) => (
              <TimeChip
                key={`tm-${slot.id}`}
                slot={slot}
                activeSlot={activeSlot}
                onClick={selectSlot}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeChip({ slot, activeSlot, onClick }) {
  return (
    <div
      className={`time-chip ${
        activeSlot === slot.label ? "selected" : ""
      }`}
      onClick={() => onClick(slot)}
    >
      {slot.label}
    </div>
  );
}
