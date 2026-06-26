import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export default function EmployeeFormModal({ isOpen, onClose, onSubmit, employee }) {
  const isEdit = !!employee;
  const initialForm = {
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    designation: "",
    joiningDate: "",
    employmentType: "Full-Time",
    employmentStatus: "Active",
    salary: "",
    profilePhoto: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAvatarError(false);
      if (employee) {
        // Pre-fill form when editing
        let formattedDate = "";
        if (employee.joiningDate) {
          try {
            formattedDate = new Date(employee.joiningDate).toISOString().split("T")[0];
          } catch (err) {
            console.error("Error parsing date:", err);
          }
        }
        setFormData({
          ...employee,
          joiningDate: formattedDate,
          salary: employee.salary !== undefined ? employee.salary : "",
        });
      } else {
        // Reset form for add mode
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "profilePhoto") {
      setAvatarError(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeId || !formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!isEdit && (!formData.password || !formData.password.trim())) {
      newErrors.password = "Password is required";
    }
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.department || !formData.department.trim()) {
      newErrors.department = "Department is required";
    }
    if (!formData.designation || !formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }
    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
    }
    if (formData.salary !== "" && (isNaN(formData.salary) || Number(formData.salary) < 0)) {
      newErrors.salary = "Salary must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        salary: formData.salary === "" ? 0 : Number(formData.salary),
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Failed to submit employee data",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialsPreview = () => {
    const first = formData.firstName ? formData.firstName.charAt(0).toUpperCase() : "";
    const last = formData.lastName ? formData.lastName.charAt(0).toUpperCase() : "";
    return first + last || "?";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? "Edit Employee Details" : "Register New Employee"}</h3>
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

            {/* Live Profile Photo Preview Banner */}
            <div className="photo-picker-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1.25rem", border: "1.5px dashed var(--border-color)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", backgroundColor: "rgba(255, 255, 255, 0.01)" }}>
              {formData.profilePhoto && !avatarError ? (
                <img
                  src={formData.profilePhoto}
                  alt="Preview"
                  className="preview-photo"
                  style={{ width: "4.5rem", height: "4.5rem", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-color)" }}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  className="avatar-placeholder-form initials-avatar"
                  style={{ width: "4.5rem", height: "4.5rem", fontSize: "1.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {getInitialsPreview()}
                </div>
              )}
              <span className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Live Photo Preview
              </span>
            </div>

            <div className="form-grid">
              {/* Employee ID */}
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP-101"
                  className="form-control"
                  disabled={isEdit}
                />
                {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
              </div>

              {/* Profile Photo URL */}
              <div className="form-group">
                <label className="form-label">Profile Photo URL</label>
                <input
                  type="url"
                  name="profilePhoto"
                  value={formData.profilePhoto}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="form-control"
                />
                {errors.profilePhoto && <span className="form-error">{errors.profilePhoto}</span>}
              </div>

              {/* First Name */}
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="form-control"
                />
                {errors.firstName && <span className="form-error">{errors.firstName}</span>}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="form-control"
                />
                {errors.lastName && <span className="form-error">{errors.lastName}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@company.com"
                  className="form-control"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Password */}
              {!isEdit && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-control"
                  />
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>
              )}

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="form-control"
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select Department</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Operations">Operations</option>
                </select>
                {errors.department && <span className="form-error">{errors.department}</span>}
              </div>

              {/* Designation */}
              <div className="form-group">
                <label className="form-label">Designation *</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Senior Software Engineer"
                  className="form-control"
                />
                {errors.designation && <span className="form-error">{errors.designation}</span>}
              </div>

              {/* Joining Date */}
              <div className="form-group">
                <label className="form-label">Joining Date *</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="form-control"
                />
                {errors.joiningDate && <span className="form-error">{errors.joiningDate}</span>}
              </div>

              {/* Salary */}
              <div className="form-group">
                <label className="form-label">Salary (USD/year)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="95000"
                  className="form-control"
                  min="0"
                />
                {errors.salary && <span className="form-error">{errors.salary}</span>}
              </div>

              {/* Employment Type */}
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Intern">Intern</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Employment Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={15} />
              {isSubmitting ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
