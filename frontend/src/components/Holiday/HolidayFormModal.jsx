import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export default function HolidayFormModal({ isOpen, onClose, onSubmit, holiday }) {
  const isEdit = !!holiday;
  const initialForm = {
    title: "",
    date: "",
    type: "Company",
    description: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (holiday) {
        let formattedDate = "";
        if (holiday.date) {
          try {
            formattedDate = new Date(holiday.date).toISOString().split("T")[0];
          } catch (err) {
            console.error("Error parsing holiday date:", err);
          }
        }
        setFormData({
          title: holiday.title || "",
          date: formattedDate,
          type: holiday.type || "Company",
          description: holiday.description || "",
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, holiday]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Holiday title is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Failed to save holiday details",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? "Edit Holiday" : "Add Company Holiday"}</h3>
          <button className="btn-icon-only" onClick={onClose} title="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="badge badge-inactive" style={{ width: "100%", padding: "0.75rem", marginBottom: "1.25rem", borderRadius: "var(--radius-md)", display: "flex", gap: "0.5rem" }}>
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Title */}
              <div className="form-group">
                <label className="form-label">Holiday Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Independence Day, New Year"
                  className="form-control"
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              {/* Date & Type Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="form-control"
                  />
                  {errors.date && <span className="form-error">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Holiday Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-control"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="National">National</option>
                    <option value="Festival">Festival</option>
                    <option value="Company">Company</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details about the holiday schedule or closure..."
                  className="form-control"
                  rows="3"
                  style={{ resize: "vertical", minHeight: "80px", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={15} />
              {isSubmitting ? "Saving..." : "Save Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
