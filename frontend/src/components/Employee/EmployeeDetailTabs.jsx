import React from "react";
import {
  Briefcase,
  Mail,
  DollarSign,
  Grid,
  Award,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";

export default function EmployeeDetailTabs({
  employee,
  activeSubTab,
  setActiveSubTab,
  formatDate,
  formatCurrency,
}) {
  return (
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
  );
}
