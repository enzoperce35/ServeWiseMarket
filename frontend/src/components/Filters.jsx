import React, { useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import "../css/components/Filters.css";

export default function Filters({ products = [], setFilteredProducts = () => {}, user = {} }) {
  const [searchText, setSearchText] = useState("");
  const [deliverFrom, setDeliverFrom] = useState([user?.community || "Sampaguita West"]);
  const [category, setCategory] = useState(["all"]);
  const [deliverToday, setDeliverToday] = useState(true);
  const [deliveryTime, setDeliveryTime] = useState(["any"]);
  const [showModal, setShowModal] = useState(false);

  const categoriesList = [
    "all", "merienda", "lutong ulam", "lutong gulay",
    "rice meal", "almusal", "dessert", "delicacy",
    "specialty", "frozen", "pulutan", "refreshment",
  ];

  const deliverFromOptions = ["Sampaguita West", "Sampaguita Homes"];
  if (user?.community) {
    deliverFromOptions.sort((a, b) =>
      a === user.community ? -1 : b === user.community ? 1 : 0
    );
  }

  const deliveryTimeOptions = [
    "any", "in 30 minutes", "5am - 5:30am", "6am - 6:30am", "7am - 7:30am", "8am - 8:30am",
    "9am - 9:30am", "10am - 10:30am", "11am - 11:30am", "12pm - 12:30pm", "1pm - 1:30pm",
    "2pm - 2:30pm", "3pm - 3:30pm", "4pm - 4:30pm", "5pm - 5:30pm", "6pm - 6:30pm", "7pm - 7:30pm"
  ];

  const applyFilters = () => {
    let filtered = [...products];

    // Search
    if (searchText.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Product status
    filtered = filtered.filter(p => p.status === true);

    // Deliver From
    if (deliverFrom.length > 0) {
      filtered = filtered.filter(
        p => p.seller?.community && deliverFrom.includes(p.seller.community)
      );
    }

    // Category
    if (!category.includes("all")) {
      filtered = filtered.filter(p => category.includes(p.category));
    }

    // Deliver Today
    if (deliverToday) {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(
        p => !p.delivery_date || p.delivery_date === today
      );
    } else {
      filtered = filtered.filter(p => p.delivery_date);
    }

    // Delivery Time
    if (!deliveryTime.includes("any")) {
      filtered = filtered.filter(p =>
        deliveryTime.some(time => p.delivery_time?.startsWith(time.split(" - ")[0]))
      );
    }

    setFilteredProducts(filtered);
    setShowModal(false);
  };

  return (
    <>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button className="filter-btn" onClick={() => setShowModal(true)}>
          <FunnelIcon className="filter-icon" />
        </button>
      </div>

      {showModal && (
        <div className="filter-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="filter-modal" onClick={e => e.stopPropagation()}>
            <h2>Filters</h2>

            {/* Deliver From */}
            <label>Deliver From</label>
            <div className="checkbox-options">
              {deliverFromOptions.map(option => (
                <label key={option}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={deliverFrom.includes(option)}
                    onChange={() =>
                      setDeliverFrom(
                        deliverFrom.includes(option)
                          ? deliverFrom.filter(c => c !== option)
                          : [...deliverFrom, option]
                      )
                    }
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Category */}
            <label>Category</label>
            <div className="checkbox-options">
              {categoriesList.map(cat => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    value={cat}
                    checked={category.includes(cat)}
                    onChange={e => {
                      if (cat === "all") setCategory(["all"]);
                      else {
                        let newCat = category.filter(c => c !== "all");
                        newCat = category.includes(cat)
                          ? newCat.filter(c => c !== cat)
                          : [...newCat, cat];
                        setCategory(newCat.length ? newCat : ["all"]);
                      }
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>

            {/* Deliver Today */}
            <label>
              <input
                type="checkbox"
                checked={deliverToday}
                onChange={e => setDeliverToday(e.target.checked)}
              />
              Deliver Today
            </label>

            {/* Delivery Time */}
            <label>Delivery Time</label>
            <div className="checkbox-options">
              {deliveryTimeOptions.map(time => (
                <label key={time}>
                  <input
                    type="checkbox"
                    value={time}
                    checked={deliveryTime.includes(time)}
                    onChange={() => {
                      if (time === "any") setDeliveryTime(["any"]);
                      else {
                        let newTimes = deliveryTime.filter(t => t !== "any");
                        newTimes = deliveryTime.includes(time)
                          ? newTimes.filter(t => t !== time)
                          : [...newTimes, time];
                        setDeliveryTime(newTimes.length ? newTimes : ["any"]);
                      }
                    }}
                  />
                  {time}
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
