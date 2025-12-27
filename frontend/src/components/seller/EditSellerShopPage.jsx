import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import "../../css/components/seller/EditSellerShopPage.css";

export default function EditSellerShopPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const [shopCommunity, setShopCommunity] = useState(""); // For dynamic labels

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
      } catch (err) {
        console.error(err);
        toast.error("Failed to load shop");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchShop();
  }, [token]);

  /* ================= DISABLE MINIMUM IF CHARGE IS ZERO ================= */
  useEffect(() => {
    if (Number(form.cross_comm_charge) === 0) {
      setForm((prev) => ({
        ...prev,
        cross_comm_minimum: 0,
      }));
    }
  }, [form.cross_comm_charge]);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative values
    if ((name === "cross_comm_charge" || name === "cross_comm_minimum") && Number(value) < 0) return;

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

    if (name === "account_number") {
      validatePHNumber(index, value);
    }
  };

  const handleAddNewAccount = () => {
    setNewAccounts([{ provider: "", account_name: "", account_number: "" }]);
  };

  const handleCancelNewAccount = () => {
    setNewAccounts([]);
    setErrors({});
  };

  /* ================= PH NUMBER VALIDATION ================= */
  const validatePHNumber = (index, value) => {
    const phRegex = /^(09|\+639)\d{9}$/;

    setErrors((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        account_number: phRegex.test(value)
          ? null
          : "Enter a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX)",
      },
    }));
  };

  /* ================= SAVE NEW PAYMENT ACCOUNT ================= */
  const handleSaveNewAccount = async (index) => {
    const account = newAccounts[index];
    const accountErrors = errors[index];

    if (!account.provider || !account.account_name || !account.account_number) {
      toast.error("Please complete all fields");
      return;
    }

    if (accountErrors?.account_number) {
      toast.error("Please fix validation errors");
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

      toast.success("Payment account added ✅");

      const res = await axiosClient.get("/seller/shop", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExistingAccounts(res.data.shop.shop_payment_accounts || []);
      setNewAccounts([]);
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error("Failed to add payment account");
    }
  };

  /* ================= DELETE EXISTING ACCOUNT ================= */
  const handleDeleteExistingAccount = async (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment account?"
    );
    if (!confirmed) return;

    try {
      await axiosClient.delete(
        `/seller/shop_payment_accounts/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment account deleted");

      setExistingAccounts((prev) =>
        prev.filter((acc) => acc.id !== accountId)
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment account");
    }
  };

  /* ================= SAVE SHOP ================= */
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

      toast.success("Shop updated successfully ✅");
      navigate(`/shops/${shopId}`);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="loading-text">Loading shop data...</p>;

  /* Determine other community for labels */
  const otherCommunity =
    shopCommunity === "Sampaguita Homes" ? "West" : "Homes";

  return (
    <div className="edit-seller-shop-page">
      <h2>Edit Your Shop</h2>

      <form onSubmit={handleSubmit}>
        {/* SHOP INFO */}
        <label>Shop Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Image URL</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} />

        <label>Free Delivery Minimum ({otherCommunity})</label>
        <input
          type="number"
          name="cross_comm_minimum"
          min="0"
          value={form.cross_comm_minimum}
          disabled={Number(form.cross_comm_charge) === 0}
          onChange={(e) => {
            const intValue = e.target.value.replace(/\D/g, "");
            setForm((prev) => ({
              ...prev,
              cross_comm_minimum: intValue,
            }));
          }}
        />

        <label>Delivery Charge ({otherCommunity})</label>
        <input
          type="number"
          name="cross_comm_charge"
          min="0"
          value={form.cross_comm_charge}
          onChange={handleChange}
        />
        
        {/* EXISTING ACCOUNTS */}
        <div className="payment-accounts-section">
          <h3>Existing Payment Accounts</h3>

          {existingAccounts.map((acc, index) => (
            <div key={acc.id} className="payment-account-row existing-account">
              <span
                className="delete-existing-account-btn"
                onClick={() => handleDeleteExistingAccount(acc.id)}
              >
                −
              </span>

              <span className="provider-text">
                {acc.provider} ({acc.account_number})
              </span>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acc.active}
                  onChange={(e) =>
                    handleExistingAccountToggle(index, e.target.checked)
                  }
                />
                Active
              </label>
            </div>
          ))}
        </div>

        {/* NEW ACCOUNT */}
        <div className="payment-accounts-section">
          {newAccounts.map((acc, index) => (
            <div key={index} className="payment-account-row new-account">
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
                <div className="error-text">{errors[index].account_number}</div>
              )}

              <div className="new-account-actions">
                <span className="new-account-cancel" onClick={handleCancelNewAccount}>
                  Cancel
                </span>
                <span className="new-account-add" onClick={() => handleSaveNewAccount(index)}>
                  Add
                </span>
              </div>
            </div>
          ))}

          {newAccounts.length === 0 && (
            <div className="add-account-wrapper">
              <button
                type="button"
                className="icon-circle-btn add-account-icon-btn"
                onClick={handleAddNewAccount}
              >
                +
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
}
