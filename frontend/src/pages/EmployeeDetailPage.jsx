import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  Award,
  Grid,
  Briefcase,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  User,
  MapPin,
  Clock
} from "lucide-react";
import { getEmployeeDbId } from "../utils/idResolver";

export default function EmployeeDetailPage({ employees, onEdit, onDelete, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Find employee matching route ID
  const employee = employees.find((emp) => getEmployeeDbId(emp) === id);

  if (!employee) {
    return (
      <div className="loading-screen fade-in">
        <p>Employee record not found.</p>
        <button className="btn btn-primary" onClick={() => navigate("/employees")}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getInitials = () => {
    const first = employee.firstName ? employee.firstName.charAt(0).toUpperCase() : "";
    const last = employee.lastName ? employee.lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  const handleDeleteConfirm = () => {
    const dbId = getEmployeeDbId(employee);
    onDelete(dbId);
    setDeleteConfirmOpen(false);
    navigate("/employees");
  };

  return (
    <div className="fade-in">
      {/* Top Header Row */}
      <div className="header-bar">
        <button className="btn btn-secondary" onClick={() => navigate("/employees")} title="Back to employee directory">
          <ArrowLeft size={16} />
          Back to Directory
        </button>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {user && user.role !== "Employee" && (
            <>
              <button className="btn btn-secondary" onClick={() => onEdit(employee)}>
                <Edit2 size={15} />
                Edit Profile
              </button>
              <button className="btn btn-danger" onClick={() => setDeleteConfirmOpen(true)}>
                <Trash2 size={15} />
                Delete Record
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Dual-pane Layout */}
      <div className="detail-layout-grid">
        
        {/* Left Pane: Avatar summary */}
        <div className="dashboard-card glass-card" style={{ alignItems: "center", textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            {employee.profilePhoto && !imgError ? (
              <img
                src={employee.profilePhoto}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="preview-photo"
                style={{ width: "7.5rem", height: "7.5rem", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border-color)", boxShadow: "var(--shadow-md)" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="avatar-placeholder-form initials-avatar"
                style={{ width: "7.5rem", height: "7.5rem", fontSize: "2.5rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}
              >
                {getInitials()}
              </div>
            )}
            
            <span
              className={`badge ${employee.employmentStatus === "Active" ? "badge-active" : "badge-inactive"}`}
              style={{ position: "absolute", bottom: "-5px", left: "50%", transform: "translateX(-50%)", padding: "0.3rem 0.75rem", boxShadow: "var(--shadow-md)", fontSize: "0.7rem" }}
            >
              {employee.employmentStatus === "Active" ? (
                <ShieldCheck size={11} />
              ) : (
                <ShieldAlert size={11} />
              )}
              {employee.employmentStatus}
            </span>
          </div>

          <h2 className="profile-name-text" style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            {employee.firstName} {employee.lastName}
          </h2>
          <span className="profile-designation" style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "1rem", letterSpacing: "0.02em" }}>
            {employee.designation}
          </span>
          <span className="card-emp-id" style={{ fontSize: "0.75rem", display: "inline-block" }}>
            {employee.employeeId}
          </span>
        </div>

        {/* Right Pane: Interactive Detail Tab Card */}
        <div className="dashboard-card glass-card" style={{ padding: "2rem" }}>
          
          {/* Sub-tab Navigation */}
          <div className="view-toggler" style={{ alignSelf: "flex-start", marginBottom: "1.75rem" }}>
            <button
              className={`toggle-btn-icon ${activeSubTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveSubTab("overview")}
              style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)", display: "flex", gap: "0.5rem" }}
            >
              <Briefcase size={15} />
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Employment</span>
            </button>
            <button
              className={`toggle-btn-icon ${activeSubTab === "contact" ? "active" : ""}`}
              onClick={() => setActiveSubTab("contact")}
              style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)", display: "flex", gap: "0.5rem" }}
            >
              <Mail size={15} />
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Contact</span>
            </button>
            <button
              className={`toggle-btn-icon ${activeSubTab === "compensation" ? "active" : ""}`}
              onClick={() => setActiveSubTab("compensation")}
              style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)", display: "flex", gap: "0.5rem" }}
            >
              <DollarSign size={15} />
              <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Salary & Joining</span>
            </button>
          </div>

          {/* Details Content Panels */}
          {activeSubTab === "overview" && (
            <div className="profile-details-grid fade-in" style={{ borderTop: "none", paddingTop: 0, gap: "1.75rem 1.5rem" }}>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <Grid size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Employee ID
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{employee.employeeId}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <Award size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Department
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{employee.department}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <User size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Designation
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{employee.designation}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <Briefcase size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Employment Type
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{employee.employmentType}</span>
              </div>
            </div>
          )}

          {activeSubTab === "contact" && (
            <div className="profile-details-grid fade-in" style={{ borderTop: "none", paddingTop: 0, gap: "1.75rem 1.5rem" }}>
              <div className="profile-detail-item" style={{ gridColumn: "span 2" }}>
                <span className="profile-detail-label">
                  <Mail size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Email Address
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem", wordBreak: "break-all" }}>{employee.email}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <Phone size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Phone Number
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{employee.phone}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <MapPin size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Work Location
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>HQ Office</span>
              </div>
            </div>
          )}

          {activeSubTab === "compensation" && (
            <div className="profile-details-grid fade-in" style={{ borderTop: "none", paddingTop: 0, gap: "1.75rem 1.5rem" }}>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <DollarSign size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Annual Salary
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{formatCurrency(employee.salary)}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <Calendar size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Joining Date
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>{formatDate(employee.joiningDate)}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  <Clock size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
                  Onboarding Phase
                </span>
                <span className="profile-detail-value" style={{ fontSize: "1.05rem" }}>Completed</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Employee Record</h3>
              <button className="btn-icon-only" onClick={() => setDeleteConfirmOpen(false)} title="Cancel">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
              <AlertTriangle size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
              <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Delete {employee.firstName} {employee.lastName}?</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                This will permanently delete this employee record from the system. This action is irreversible.
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: "none", paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
