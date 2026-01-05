import React, { useEffect, useRef, useState } from "react";
import "../css/components/TimeFilterBar.css";

const HOURS_24 = [
  6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18, 19, 20
];

const BUFFER_HOURS = 2;

const formatHour = (h) => {
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "pm" : "am";
  return `${hour12}${ampm}`;
};

const buildSlots = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const minHour = currentHour + BUFFER_HOURS;

  const today = [];
  const tomorrow = [];

  // ✅ Add "Now" as the very first Today slot
  today.push({
    hour24: currentHour,
    label: "Now",
    day: "today",
    isNow: true,
  });

  HOURS_24.forEach(hour24 => {
    if (hour24 >= minHour) {
      today.push({
        hour24,
        label: formatHour(hour24),
        day: "today",
      });
    } else {
      tomorrow.push({
        hour24,
        label: formatHour(hour24),
        day: "tomorrow",
      });
    }
  });

  return { today, tomorrow };
};

export default function TimeFilterBar({ onChange }) {
  const scrollRef = useRef(null);
  const [slots, setSlots] = useState({ today: [], tomorrow: [] });
  const [activeDay, setActiveDay] = useState("today");
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    const built = buildSlots();
    setSlots(built);

    const firstToday = built.today[0];
    const firstTomorrow = built.tomorrow[0];

    const initial = firstToday || firstTomorrow;
    if (initial) {
      setActiveSlot(initial.label);
      onChange?.(initial);
      setActiveDay(initial.day);
    }
  }, []);

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
            {slots.today.map((slot, i) => (
              <TimeChip
                key={`t-${i}`}
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
            {slots.tomorrow.map((slot, i) => (
              <TimeChip
                key={`tm-${i}`}
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
