import React, { useState, useEffect } from "react";
import { Landmark, Lock, Edit2, CheckCircle, AlertTriangle, AlertCircle, Save, X, CreditCard } from "lucide-react";

export default function EmployeeBankDetailsView({ bankDetails, onSubmit, isSubmitting }) {
  const [isEditing, setIsEditing] = useState(!bankDetails);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "Savings",
    upiId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bankDetails) {
      setFormData({
        accountHolderName: bankDetails.accountHolderName || "",
        bankName: bankDetails.bankName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        branchName: bankDetails.branchName || "",
        accountType: bankDetails.accountType || "Savings",
        upiId: bankDetails.upiId || "",
      });
      setIsEditing(false);
    } else {
      setIsEditing(true); // default to form if no bank details exists
    }
  }, [bankDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "ifscCode") {
      val = value.toUpperCase().slice(0, 11);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be between 9 and 18 digits";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC Code format (e.g. SBIN0012345)";
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    if (formData.upiId.trim() && !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      newErrors.upiId = "Invalid UPI ID format (e.g. name@bank)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      if (bankDetails) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Failed to save bank details",
      }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return {
          class: "badge-active",
          icon: <CheckCircle size={16} style={{ color: "var(--success)" }} />,
          label: "Verified",
          desc: "Your bank details are verified by HR and locked for modifications.",
        };
      case "Rejected":
        return {
          class: "badge-inactive",
          icon: <AlertCircle size={16} style={{ color: "var(--danger)" }} />,
          label: "Rejected",
          desc: "Your bank details were rejected. Please review and update details to submit again.",
        };
      case "Pending":
      default:
        return {
          class: "badge-warning",
          icon: <AlertTriangle size={16} style={{ color: "var(--warning)" }} />,
          label: "Pending Verification",
          desc: "Your details are pending HR review. You can edit them until verified.",
        };
    }
  };

  const statusInfo = bankDetails ? getStatusBadge(bankDetails.status) : null;

  if (isEditing || !bankDetails) {
    return (
      <div className="dashboard-card glass-card fade-in" style={{ padding: "2rem", maxWidth: "680px", margin: "1.5rem auto 0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
          <Landmark size={24} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {bankDetails ? "Update Bank Details" : "Add Bank Details"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="badge badge-inactive" style={{ width: "100%", padding: "0.75rem", marginBottom: "1.25rem", borderRadius: "var(--radius-md)", display: "flex", gap: "0.5rem" }}>
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Account Holder Name */}
            <div className="form-group">
              <label className="form-label">Account Holder Name *</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Name as in bank passbook"
                className={`form-control ${errors.accountHolderName ? "is-invalid" : ""}`}
              />
              {errors.accountHolderName && <span className="error-message" style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{errors.accountHolderName}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Bank Name */}
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. State Bank of India"
                  className={`form-control ${errors.bankName ? "is-invalid" : ""}`}
                />
                {errors.bankName && <span className="error-message" style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{errors.bankName}</span>}
              </div>

              {/* Account Number */}
              <div className="form-group">
                <label className="form-label">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="e.g. 10023049593"
                  className={`form-control ${errors.accountNumber ? "is-invalid" : ""}`}
                />
                {errors.accountNumber && <span className="error-message" style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{errors.accountNumber}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* IFSC Code */}
              <div className="form-group">
                <label className="form-label">IFSC Code *</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="e.g. SBIN0012345"
                  className={`form-control ${errors.ifscCode ? "is-invalid" : ""}`}
                />
                {errors.ifscCode && <span className="error-message" style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{errors.ifscCode}</span>}
              </div>

              {/* Branch Name */}
              <div className="form-group">
                <label className="form-label">Branch Name *</label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="e.g. Connaught Place"
                  className={`form-control ${errors.branchName ? "is-invalid" : ""}`}
                />
                {errors.branchName && <span className="error-message" style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{errors.branchName}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Account Type */}
              <div className="form-group">
                <label className="form-label">Account Type *</label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>

              {/* UPI ID */}
              <div className="form-group">
                <label className="form-label">UPI ID (Optional)</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder="e.g. username@okaxis"
                  className={`form-control ${errors.upiId ? "is-invalid" : ""}`}
                />
                {errors.upiId && <span className="error-message" style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{errors.upiId}</span>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
              {bankDetails && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                disabled={isSubmitting}
              >
                <Save size={16} />
                {isSubmitting ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Display details card
  return (
    <div className="dashboard-card glass-card fade-in" style={{ padding: "2rem", maxWidth: "680px", margin: "1.5rem auto 0 auto" }}>
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <CreditCard size={24} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>Bank Account Details</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className={`badge ${statusInfo.class}`} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.65rem", fontSize: "0.8rem", fontWeight: 600 }}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Info Status Banner */}
      <div 
        style={{ 
          display: "flex", 
          gap: "0.75rem", 
          alignItems: "flex-start", 
          padding: "1rem 1.25rem", 
          borderRadius: "var(--radius-lg)", 
          backgroundColor: bankDetails.status === "Verified" ? "var(--success-light)" : bankDetails.status === "Rejected" ? "var(--danger-light)" : "var(--warning-light)",
          border: `1px solid ${bankDetails.status === "Verified" ? "var(--success)" : bankDetails.status === "Rejected" ? "var(--danger)" : "var(--warning)"}1f`,
          marginBottom: "1.5rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)"
        }}
      >
        {bankDetails.status === "Verified" ? <Lock size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: "0.15rem" }} /> : <AlertTriangle size={16} style={{ color: bankDetails.status === "Rejected" ? "var(--danger)" : "var(--warning)", flexShrink: 0, marginTop: "0.15rem" }} />}
        <span>{statusInfo.desc}</span>
      </div>

      {/* Bank Info Grid */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "1.5rem 2rem", 
          marginBottom: "1.5rem"
        }}
        className="bank-details-info-grid"
      >
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Account Holder Name</label>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{bankDetails.accountHolderName}</span>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Bank Name</label>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{bankDetails.bankName}</span>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Account Number</label>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
            {"•••• •••• " + bankDetails.accountNumber.slice(-4)}
          </span>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>IFSC Code</label>
          <span style={{ fontSize: "1rem", fontWeight: 600, fontFamily: "monospace", color: "var(--text-primary)" }}>{bankDetails.ifscCode}</span>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Branch Name</label>
          <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>{bankDetails.branchName}</span>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Account Type</label>
          <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>{bankDetails.accountType}</span>
        </div>

        {bankDetails.upiId && (
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>UPI ID</label>
            <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)" }}>{bankDetails.upiId}</span>
          </div>
        )}
      </div>

      {/* Edit Trigger Panel */}
      {bankDetails.status !== "Verified" ? (
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Edit2 size={16} />
            Edit Bank Details
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", color: "var(--text-muted)", fontSize: "0.8rem", alignItems: "center", gap: "0.35rem" }}>
          <Lock size={12} />
          <span>Locked. Contact HR to make any changes.</span>
        </div>
      )}
    </div>
  );
}
