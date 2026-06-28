import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function EmployeeDetailCard({ employee }) {
  return (
    <div className="dashboard-card glass-card" style={{ alignItems: "center", textAlign: "center", padding: "2.5rem 1.5rem" }}>
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <EmployeeAvatar
          emp={employee}
          className="preview-photo"
          style={{ width: "7.5rem", height: "7.5rem", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border-color)", boxShadow: "var(--shadow-md)" }}
        />
        
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
  );
}
