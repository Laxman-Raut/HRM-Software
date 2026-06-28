import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export default function WarningFormModal({ isOpen, onClose, onSubmit, employees }) {
  const initialForm = {
    employee: "",
    title: "",
    description: "",
    severity: "Low"
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
    if (!formData.employee) {
      newErrors.employee = "Please select an employee";
    }
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Warning title is required";
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Warning description is required";
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
        submit: err.message || "Failed to issue warning",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Issue Policy Warning</h3>
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
              {/* Select Employee */}
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId} - {emp.department})
                    </option>
                  ))}
                </select>
                {errors.employee && <span className="form-error">{errors.employee}</span>}
              </div>

              {/* Warning Title */}
              <div className="form-group">
                <label className="form-label">Warning Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Excessive Tardiness, Policy Violation"
                  className="form-control"
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              {/* Severity Selection */}
              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Warning Description */}
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the incident or policy violation..."
                  className="form-control"
                  rows="4"
                  style={{ resize: "vertical", minHeight: "80px", fontFamily: "inherit" }}
                />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={15} />
              {isSubmitting ? "Issuing..." : "Issue Warning"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
