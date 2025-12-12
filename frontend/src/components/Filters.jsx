import React, { useState, useEffect } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import "../css/components/Filters.css";

export default function Filters({ products = [], setFilteredProducts = () => {}, user = {} }) {
  const [searchText, setSearchText] = useState("");
  const [deliverFrom, setDeliverFrom] = useState([]);
  const [category, setCategory] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Temporary modal filters
  const [tempDeliverFrom, setTempDeliverFrom] = useState([]);
  const [tempCategory, setTempCategory] = useState([]);
  const [tempDeliveryTime, setTempDeliveryTime] = useState([]);

  // OPTIONS
  const categoriesList = [
    "merienda","lutong ulam","lutong gulay","rice meal","pasta","almusal",
    "dessert","delicacy","specialty","frozen","pulutan","refreshment"
  ];

  const deliverFromOptions = ["Sampaguita West", "Sampaguita Homes"];

  const deliveryTimeOptions = [
    "in 30 minutes","6am - 6:30am","7am - 7:30am","8am - 8:30am",
    "9am - 9:30am","10am - 10:30am","11am - 11:30am","12pm - 12:30pm","1pm - 1:30pm",
    "2pm - 2:30pm","3pm - 3:30pm","4pm - 4:30pm","5pm - 5:30pm","6pm - 6:30pm","7pm - 7:30pm"
  ];

  // MAIN FILTER LOGIC — runs everytime filters change
  useEffect(() => {
    let filtered = [...products];
    const userCommunity = user?.community?.trim();

    // COMMUNITY FILTER (cross-comm allowed)
    filtered = filtered.filter(p => {
      const shop = p.shop?.user?.community?.trim();
      if (!shop) return false;
      if (shop === userCommunity) return true;
      return p.cross_comm_delivery === true || p.cross_comm_delivery === "true";
    });

    // SEARCH FILTER
    if (searchText.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // ACTIVE ONLY
    filtered = filtered.filter(p => p.status === true);

    // DELIVER FROM FILTER
    if (deliverFrom.length > 0) {
      filtered = filtered.filter(p => deliverFrom.includes(p.shop?.user?.community));
    }

    // CATEGORY FILTER
    if (category.length > 0) {
      filtered = filtered.filter(p => category.includes(p.category));
    }

    // DELIVERY TIME
    if (deliveryTime.length > 0) {
      filtered = filtered.filter(p => {
        const hasDate = !!p.delivery_date;
        const hasTime = !!p.delivery_time;
        const today = new Date().toISOString().split("T")[0];

        return deliveryTime.some(option => {
          if (option === "in 30 minutes") return (!hasDate || (p.delivery_date === today && !hasTime));
          if (!hasTime) return false;

          const hour = new Date(p.delivery_time).getHours();
          const [start, end] = option.split(" - ");
          const to24 = t => {
            let h = parseInt(t);
            if (t.includes("pm") && h !== 12) h += 12;
            if (t.includes("am") && h === 12) h = 0;
            return h;
          };
          return hour >= to24(start) && hour <= to24(end);
        });
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchText, deliverFrom, category, deliveryTime, user]);

  // APPLY filters from modal
  const applyFilters = () => {
    setDeliverFrom(tempDeliverFrom);
    setCategory(tempCategory);
    setDeliveryTime(tempDeliveryTime);
    setShowModal(false);
  };

  // RESET instantly — no need to refresh / apply
  const resetFilters = () => {
    setSearchText("");
    setDeliverFrom([]);
    setCategory([]);
    setDeliveryTime([]);
    setTempDeliverFrom([]);
    setTempCategory([]);
    setTempDeliveryTime([]);
    setShowModal(false); 
  };

  return (
    <>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button className="filter-btn" onClick={() => {
          setTempDeliverFrom(deliverFrom);
          setTempCategory(category);
          setTempDeliveryTime(deliveryTime);
          setShowModal(true);
        }}>
          <FunnelIcon className="filter-icon" />
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="filter-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="filter-modal" onClick={e => e.stopPropagation()}>
            <h2>Filters</h2>

            {/* DELIVER FROM */}
            <label>Deliver From</label>
            <div className="checkbox-options">
              {deliverFromOptions.map(o => (
                <label key={o}>
                  <input
                    type="checkbox"
                    checked={tempDeliverFrom.includes(o)}
                    onChange={() =>
                      setTempDeliverFrom(
                        tempDeliverFrom.includes(o)
                          ? tempDeliverFrom.filter(v => v !== o)
                          : [...tempDeliverFrom, o]
                      )
                    }
                  />
                  {o}
                </label>
              ))}
            </div>

            {/* CATEGORY */}
            <label>Category</label>
            <div className="checkbox-options">
              {categoriesList.map(cat => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    checked={tempCategory.includes(cat)}
                    onChange={() =>
                      setTempCategory(
                        tempCategory.includes(cat)
                          ? tempCategory.filter(c => c !== cat)
                          : [...tempCategory, cat]
                      )
                    }
                  />
                  {cat}
                </label>
              ))}
            </div>

            {/* DELIVERY TIME */}
            <label>Delivery Time</label>
            <div className="checkbox-options">
              {deliveryTimeOptions.map(time => (
                <label key={time}>
                  <input
                    type="checkbox"
                    checked={tempDeliveryTime.includes(time)}
                    onChange={() =>
                      setTempDeliveryTime(
                        tempDeliveryTime.includes(time)
                          ? tempDeliveryTime.filter(t => t !== time)
                          : [...tempDeliveryTime, time]
                      )
                    }
                  />
                  {time}
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
              <button className="reset-btn" onClick={resetFilters}>Reset</button>
              <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
