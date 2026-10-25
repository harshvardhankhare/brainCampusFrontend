import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

import api from "../../../api/axios"; // Adjust path to your axios instance
import "./FeeTypes.css";

const EMPTY_FORM = {
  name: "",
  code: "",
  isRecurring: false,
  isActive: true,
};

const FeeTypes = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================================================
  // Fetch Data
  // =========================================================
  const fetchFeeTypes = async () => {
    try {
      setLoading(true);
      setError("");
      // includeInactive=true so the admin can see and reactivate old types
      const response = await api.get("/fee-types?includeInactive=true");
      setFeeTypes(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch fee types:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load fee types. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  // =========================================================
  // Handlers
  // =========================================================
  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingId(type.id);
      setFormData({
        name: type.name,
        code: type.code || "",
        isRecurring: type.isRecurring || false,
        isActive: type.isActive ?? true,
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Fee type name is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim() || null,
      };

      if (editingId) {
        await api.patch(`/fee-types/${editingId}`, payload);
      } else {
        await api.post("/fee-types", payload);
      }

      handleCloseModal();
      fetchFeeTypes(); // Refresh list
    } catch (err) {
      console.error("Failed to save fee type:", err);
      setFormError(
        err.response?.data?.message || "Failed to save. Name might be duplicate."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this fee type? (If it is used in any fees, the system will prevent deletion and ask you to deactivate it instead)."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/fee-types/${id}`);
      fetchFeeTypes();
    } catch (err) {
      console.error("Failed to delete:", err);
      alert(
        err.response?.data?.message ||
          "Cannot delete this fee type because it is in use."
      );
    }
  };

  // =========================================================
  // Render
  // =========================================================
  if (loading && feeTypes.length === 0) {
    return (
      <div className="fee-types-page">
        <div className="loading">Loading fee types...</div>
      </div>
    );
  }

  return (
    <div className="fee-types-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Types</h1>
          <p className="page-subtitle">
            Define the categories of fees your school charges (e.g., Tuition, Transport)
          </p>
        </div>

        <button className="primary-btn" onClick={() => handleOpenModal()}>
          <FaPlus /> Add Fee Type
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Table Card */}
      <div className="table-card">
        {feeTypes.length === 0 ? (
          <div className="empty-state">
            <FaInfoCircle size={36} className="empty-icon" />
            <h3>No Fee Types Defined</h3>
            <p>You must add at least one fee type (like "Tuition") before you can assign fees to students.</p>
            <button className="primary-btn mt-4" onClick={() => handleOpenModal()}>
              <FaPlus /> Add First Fee Type
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="fee-types-table">
              <thead>
                <tr>
                  <th>Fee Name</th>
                  <th>Code</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeTypes.map((type) => (
                  <tr key={type.id} className={!type.isActive ? "row-inactive" : ""}>
                    <td>
                      <strong>{type.name}</strong>
                    </td>
                    <td>
                      {type.code ? (
                        <span className="code-badge">{type.code}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {type.isRecurring ? (
                        <span className="freq-badge freq-monthly">Monthly</span>
                      ) : (
                        <span className="freq-badge freq-once">One-off</span>
                      )}
                    </td>
                    <td>
                      {type.isActive ? (
                        <span className="status-badge status-active">
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <span className="status-badge status-inactive">
                          <FaExclamationCircle /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="action-btns">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleOpenModal(type)}
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(type.id)}
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================
          ADD / EDIT MODAL
          ========================================================= */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Fee Type" : "New Fee Type"}</h2>
                <p className="modal-subtitle">
                  {editingId
                    ? "Update details for this fee category."
                    : "Create a new category of fee for your school."}
                </p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            {formError && <div className="error-banner">{formError}</div>}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Fee Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Tuition Fee, Lab Fee"
                  required
                  autoFocus
                />
                {editingId && (
                  <span className="field-hint">
                    <FaInfoCircle /> Renaming affects future fees only. Existing
                    fees keep their original name on receipts.
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Short Code (optional)</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., TUIT, LAB"
                    maxLength={30}
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="isActive"
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Active (Available for new fees)</option>
                    <option value="false">Inactive (Hidden from new fees)</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>This is a monthly fee</strong>
                    <p className="checkbox-desc">
                      Check this if the fee is charged every month (e.g., Tuition, Transport). 
                      Leave unchecked for annual or one-time fees (e.g., Exam, Admission).
                    </p>
                  </div>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Fee Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeTypes;