import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import "../../css/pages/seller/product_settings.css";

export default function EditSellerShopPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopCommunity, setShopCommunity] = useState("");

  const [form, setForm] = useState({
    name: "",
    image_url: "",
    cross_comm_charge: 0,
    cross_comm_minimum: 0,
    open: true,
  });

  const [existingAccounts, setExistingAccounts] = useState([]);
  const [newAccounts, setNewAccounts] = useState([]);
  const [errors, setErrors] = useState({});

  /* ================= LOAD SHOP ================= */
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axiosClient.get("/seller/shop", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const shop = res.data.shop;
        setShopId(shop.id);
        setShopCommunity(shop.community || "");

        setForm({
          name: shop.name || "",
          image_url: shop.image_url || "",
          cross_comm_charge: shop.cross_comm_charge || 0,
          cross_comm_minimum: shop.cross_comm_minimum || 0,
          open: shop.open,
        });

        setExistingAccounts(shop.shop_payment_accounts || []);
      } catch {
        toast.error("Failed to load shop");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchShop();
  }, [token]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "cross_comm_charge" || name === "cross_comm_minimum") &&
      Number(value) < 0
    )
      return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExistingAccountToggle = (index, checked) => {
    setExistingAccounts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], active: checked };
      return updated;
    });
  };

  const handleNewAccountChange = (index, e) => {
    const { name, value } = e.target;

    setNewAccounts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });

    if (name === "account_number") validatePHNumber(index, value);
  };

  const handleAddNewAccount = () => {
    setNewAccounts([{ provider: "", account_name: "", account_number: "" }]);
  };

  const handleCancelNewAccount = () => {
    setNewAccounts([]);
    setErrors({});
  };

  const validatePHNumber = (index, value) => {
    const phRegex = /^(09|\+639)\d{9}$/;

    setErrors((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        account_number: phRegex.test(value)
          ? null
          : "Enter valid PH number (09XXXXXXXXX or +639XXXXXXXXX)",
      },
    }));
  };

  const handleSaveNewAccount = async (index) => {
    const account = newAccounts[index];
    const accountErrors = errors[index];

    if (!account.provider || !account.account_name || !account.account_number) {
      toast.error("Complete all fields");
      return;
    }

    if (accountErrors?.account_number) {
      toast.error("Fix validation errors");
      return;
    }

    try {
      await axiosClient.put(
        "/seller/shop",
        {
          shop: form,
          shop_payment_accounts: [account],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment account added");

      const res = await axiosClient.get("/seller/shop", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExistingAccounts(res.data.shop.shop_payment_accounts || []);
      setNewAccounts([]);
      setErrors({});
    } catch {
      toast.error("Failed to add account");
    }
  };

  const handleDeleteExistingAccount = async (accountId) => {
    if (!window.confirm("Delete this payment account?")) return;

    try {
      await axiosClient.delete(
        `/seller/shop_payment_accounts/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment account deleted");

      setExistingAccounts((prev) =>
        prev.filter((acc) => acc.id !== accountId)
      );
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.put(
        "/seller/shop",
        {
          shop: form,
          existing_accounts: existingAccounts,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Shop updated ✅");
      navigate(`/shops/${shopId}`);
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  const otherCommunity =
    shopCommunity === "Sampaguita Homes" ? "West" : "Homes";

  /* ================= JSX ================= */
  return (
    <div className="settings-page">
      <h2 className="settings-title">Edit Shop</h2>

      <form onSubmit={handleSubmit}>
        {/* SHOP INFO */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Shop Information</h3>
          </div>

          <div className="section-body">
            <div className="settings-item">
              <label>Shop Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="settings-item">
              <label>Image URL</label>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* DELIVERY SETTINGS */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Delivery Settings</h3>
          </div>

          <div className="section-body">
            <div className="settings-item">
              <label>Free Delivery Minimum ({otherCommunity})</label>
              <input
                type="number"
                name="cross_comm_minimum"
                value={form.cross_comm_minimum}
                disabled={Number(form.cross_comm_charge) === 0}
                onChange={handleChange}
              />
            </div>

            <div className="settings-item">
              <label>Delivery Charge ({otherCommunity})</label>
              <input
                type="number"
                name="cross_comm_charge"
                value={form.cross_comm_charge}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* PAYMENT ACCOUNTS */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Payment Accounts</h3>
          </div>

          <div className="section-body">
            {existingAccounts.map((acc, index) => (
              <div key={acc.id} className="cross-delivery-row">
              <span
                className="delete-dash"
                onClick={() => handleDeleteExistingAccount(acc.id)}
                title="Delete this account"
              ></span>
              <span>
                {acc.provider} ({acc.account_number})
              </span>
            
              <input
                type="checkbox"
                checked={acc.active}
                onChange={(e) =>
                  handleExistingAccountToggle(index, e.target.checked)
                }
              />
            </div>
            
            ))}

            {newAccounts.map((acc, index) => (
              <div key={index} className="settings-item">
                <select
                  name="provider"
                  value={acc.provider}
                  onChange={(e) => handleNewAccountChange(index, e)}
                >
                  <option value="">Select Provider</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                </select>

                <input
                  name="account_name"
                  placeholder="Account Name"
                  value={acc.account_name}
                  onChange={(e) => handleNewAccountChange(index, e)}
                />

                <input
                  name="account_number"
                  placeholder="Account Number"
                  value={acc.account_number}
                  onChange={(e) => handleNewAccountChange(index, e)}
                  className={errors[index]?.account_number ? "input-error" : ""}
                />

                {errors[index]?.account_number && (
                  <small className="error-text">
                    {errors[index].account_number}
                  </small>
                )}

                <div className="settings-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancelNewAccount}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    onClick={() => handleSaveNewAccount(index)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}

            {newAccounts.length === 0 && (
              <button
                type="button"
                className="save-btn"
                onClick={handleAddNewAccount}
              >
                + Add Payment Account
              </button>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="settings-actions">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
