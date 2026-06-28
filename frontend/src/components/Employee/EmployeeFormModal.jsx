import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import EmployeeFormFields from "./EmployeeFormFields";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAvatarError(false);
      setSelectedImage(null);
      setPreviewImage("");
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
const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  // Maximum 2MB
  if (file.size > 2 * 1024 * 1024) {
    alert("Image size should not exceed 2 MB.");
    return;
  }

  // Allowed image types
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, JPEG, PNG and WEBP images are allowed.");
    return;
  }

  setSelectedImage(file);
  setPreviewImage(URL.createObjectURL(file));
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
        profilePhotoFile: selectedImage,
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
              {(previewImage || formData.profilePhoto) && !avatarError ? (
                <img
                  src={previewImage || formData.profilePhoto}
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="btn btn-secondary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem", minHeight: "auto", cursor: "pointer", marginTop: "0.5rem" }}
              >
                Upload Photo
              </label>
            </div>

            {/* Decomposed Form Fields Sub-Component */}
            <EmployeeFormFields
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              isEdit={isEdit}
            />
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
