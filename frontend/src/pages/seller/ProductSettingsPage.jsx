import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSellerProducts, updateProduct, createProduct, deleteProduct } from "../../api/seller/products";
import { fetchShop } from "../../api/seller/shops";
import { fetchDeliveryGroups } from "../../api/delivery_groups";
import { useAuthContext } from "../../context/AuthProvider";
import "../../css/pages/seller/product_settings.css";
import { localDateString } from "../../utils/deliveryDateTime";

const CATEGORIES = [
  "merienda", "lutong ulam", "lutong gulay", "rice meal", "pasta",
  "almusal", "dessert", "delicacy", "specialty", "frozen", "pulutan", "refreshment",
];

export default function ProductSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [shop, setShop] = useState(null);
  const [product, setProduct] = useState(null);
  const [deliveryGroups, setDeliveryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);

  const update = (key, value) => setProduct(prev => ({ ...prev, [key]: value }));

  const toggleDeliveryGroup = (groupId) => {
    setProduct(prev => {
      const exists = prev.delivery_group_ids?.includes(groupId);
      const updated = exists
        ? prev.delivery_group_ids.filter(id => id !== groupId)
        : [...(prev.delivery_group_ids || []), groupId];
      return { ...prev, delivery_group_ids: updated };
    });
  };

  const isGroupSelected = (groupId) => product.delivery_group_ids?.includes(groupId);

  // ----------------- LOAD DATA -----------------
  useEffect(() => {
    (async () => {
      const s = await fetchShop();
      setShop(s);

      const groups = await fetchDeliveryGroups();
      setDeliveryGroups(groups);

      const today = new Date();
      const todayStr = localDateString(today);
      const defaultTime = new Date(today);
      defaultTime.setHours(20, 0, 0, 0);

      let initialProduct;
      if (id) {
        const prods = await fetchSellerProducts();
        const found = prods.find(p => p.id === parseInt(id));
        initialProduct = {
          ...found,
          delivery_group_ids: found.delivery_groups?.map(dg => dg.id) || [],
          delivery_date: found.delivery_date ? localDateString(new Date(found.delivery_date)) : todayStr,
          delivery_time: found.delivery_time ? new Date(found.delivery_time) : defaultTime,
        };
      } else {
        initialProduct = {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          category: "",
          image_url: "",
          status: true,
          preorder_delivery: false,
          delivery_date: todayStr,
          delivery_time: defaultTime,
          delivery_group_ids: [],
          cross_comm_delivery: false,
        };
      }

      setProduct(initialProduct);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !product || !shop || !user) return <p className="loading">Loading...</p>;

  // ----------------- SAVE PRODUCT -----------------
  const saveProduct = async () => {
    const body = {
      ...product,
      shop_id: shop.id,
      delivery_group_ids: product.delivery_group_ids,
    };

    if (id) await updateProduct(id, body);
    else await createProduct(body);

    navigate("/seller/products");
  };

  const deleteProductHandler = async () => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    navigate("/seller/products");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("image_url", reader.result);
    reader.readAsDataURL(file);
  };

  const communityText = user.community === "Sampaguita West"
    ? "Deliver to Sampaguita Homes"
    : "Deliver to Sampaguita West";

  // ----------------- JSX -----------------
  return (
    <div className="settings-page">
      <h2 className="settings-title">{id ? "Edit Product" : "Create Product"}</h2>

      {/* BASIC INFO */}
      <div className="settings-section">
        <div className="section-header" onClick={() => setBasicInfoOpen(!basicInfoOpen)}>
          <h3>{product.name || "Basic Info"}</h3>
          <span>{basicInfoOpen ? "-" : "+"}</span>
        </div>
        {basicInfoOpen && (
          <div className="section-body">
            <div className="settings-item">
              <label>Product Name</label>
              <input type="text" value={product.name || ""} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="settings-item">
              <label>Description</label>
              <textarea value={product.description || ""} onChange={e => update("description", e.target.value)} />
            </div>
            <div className="settings-item">
              <label>Category</label>
              <select value={product.category || ""} onChange={e => update("category", e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="settings-item">
              <label>Price (₱)</label>
              <input type="number" min="0" value={product.price ?? ""} placeholder="0"
                onChange={e => update("price", e.target.value === "" ? null : parseFloat(e.target.value))} />
            </div>
            <div className="settings-item">
              <label>Product Image</label>
              <input type="file" onChange={handleImageUpload} />
              {product.image_url && <img src={product.image_url} className="image-preview" />}
            </div>
          </div>
        )}
      </div>

      {/* INVENTORY */}
      <div className="settings-section">
        <div className="section-header"><h3>Inventory</h3></div>
        <div className="section-body">
          <div className="settings-item">
            <label>Available Stock</label>
            <input type="number" min="0" value={product.stock ?? ""} placeholder="0"
              onChange={e => update("stock", e.target.value === "" ? null : parseInt(e.target.value))} />
          </div>
        </div>
      </div>

      {/* DELIVERY GROUPS */}
      <div className="settings-section">
        <div className="section-header"><h3>Delivery Groups</h3></div>
        <div className="section-body">
          <div className="time-picker">
            {deliveryGroups.map(group => (
              <div
                key={group.id}
                className={`time-box ${isGroupSelected(group.id) ? "selected" : ""}`}
                onClick={() => toggleDeliveryGroup(group.id)}
              >
                {group.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CROSS-COMMUNITY DELIVERY */}
      <div className="settings-section">
        <div className="section-header"><h3>Delivery Options</h3></div>
        <div className="section-body">
          <div className="cross-delivery-row">
            <label>{communityText}</label>
            <input
              type="checkbox"
              checked={product.cross_comm_delivery || false}
              onChange={e => update("cross_comm_delivery", e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="settings-actions">
        <button className="save-btn" onClick={saveProduct}>{id ? "Save Changes" : "Add Product"}</button>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        {id && <button className="delete-btn" onClick={deleteProductHandler}>Delete Product</button>}
      </div>
    </div>
  );
}
