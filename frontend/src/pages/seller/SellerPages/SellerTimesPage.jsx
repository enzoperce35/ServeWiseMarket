import React, { useEffect, useState } from "react";
import { fetchDeliveryGroups } from "../../../api/delivery_groups";
import "../../../css/pages/seller/SellerPages/SellerTimesPage.css";

const formatHourLabel = (hour) => {
  if (hour === -1) return "Now";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? "pm" : "am";
  return `${h12}${ampm}`;
};

export default function SellerTimesPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const res = await fetchDeliveryGroups();

        // Flatten response to only include id, ph_timestamp, active
        const flatGroups = res.map((g) => ({
          id: g.id,
          ph_timestamp: g.ph_timestamp,
          active: g.active,
        }));

        setGroups(flatGroups);
      } catch (err) {
        console.error("Failed to fetch delivery groups:", err);
      }
      setLoading(false);
    };

    loadGroups();
  }, []);

  const toggleGroupActive = async (groupId, targetActive) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/delivery_groups/${groupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: targetActive }),
      });

      if (!res.ok) throw new Error(`Failed to update group: ${res.status}`);

      const data = await res.json();
      const updatedGroup = data.delivery_group;

      setGroups((prev) =>
        prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
      );
    } catch (err) {
      console.error("Error toggling group:", err);
      alert(`Error toggling group: ${err.message}`);
    }
  };

  if (loading) return <p>Loading delivery times...</p>;

  return (
    <div className="seller-times-page">
      <h2>Delivery Times</h2>

      <table className="times-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Active</th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>{group.ph_timestamp === -1 ? "Now" : formatHourLabel(group.ph_timestamp)}</td>
              <td>
                <input
                  type="checkbox"
                  checked={group.active}
                  onChange={() => toggleGroupActive(group.id, !group.active)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
