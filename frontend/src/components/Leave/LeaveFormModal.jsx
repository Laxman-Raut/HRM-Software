import React, { useState, useEffect } from "react";
import { X, Send, AlertCircle } from "lucide-react";

export default function LeaveFormModal({ isOpen, onClose, onSubmit }) {
  const initialForm = {
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.leaveType) newErrors.leaveType = "Please select a leave type";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be before start date";
    }
    if (!formData.reason || !formData.reason.trim()) {
      newErrors.reason = "Reason is required";
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
      setErrors((prev) => ({ ...prev, submit: err.message || "Failed to submit leave request" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Apply for Leave</h3>
          <button className="btn-icon-only" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div
                className="badge badge-inactive"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  marginBottom: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Leave Type */}
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select Leave Type</option>
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Annual">Annual</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Paternity">Paternity</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Other">Other</option>
                </select>
                {errors.leaveType && <span className="form-error">{errors.leaveType}</span>}
              </div>

              {/* Date Range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="form-control"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.startDate && <span className="form-error">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="form-control"
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                  />
                  {errors.endDate && <span className="form-error">{errors.endDate}</span>}
                </div>
              </div>

              {/* Auto-computed total days preview */}
              {formData.startDate && formData.endDate && formData.endDate >= formData.startDate && (
                <div
                  style={{
                    background: "var(--primary-light)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.6rem 1rem",
                    fontSize: "0.85rem",
                    color: "var(--primary)",
                    fontWeight: 600,
                  }}
                >
                  Total Duration:{" "}
                  {Math.floor(
                    (new Date(formData.endDate) - new Date(formData.startDate)) /
                      (1000 * 60 * 60 * 24)
                  ) + 1}{" "}
                  day(s)
                </div>
              )}

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Briefly describe the reason for your leave request..."
                  className="form-control"
                  rows="4"
                  style={{ resize: "vertical", minHeight: "90px", fontFamily: "inherit" }}
                />
                {errors.reason && <span className="form-error">{errors.reason}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Send size={15} />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
