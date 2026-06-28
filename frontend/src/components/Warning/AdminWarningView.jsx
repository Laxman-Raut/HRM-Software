import React from "react";
import { CheckCircle, Trash2, ShieldAlert, AlertTriangle } from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function AdminWarningView({ warnings, handleResolve, handleDeleteClick, formatDate }) {
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "High":
        return "badge-inactive"; // red
      case "Medium":
        return "badge-type"; // amber/gray
      case "Low":
      default:
        return "badge-active"; // green
    }
  };

  return (
    <div className="table-container" style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Warning Info</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Issued By</th>
            <th>Date</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warnings.length > 0 ? (
            warnings.map((w) => {
              const emp = w.employee || {};
              const dbId = w._id || w.id;
              return (
                <tr key={dbId}>
                  <td>
                    <div className="employee-profile">
                      <EmployeeAvatar emp={emp} />
                      <div className="employee-info-cell">
                        <span className="employee-name">
                          {emp.firstName ? `${emp.firstName} ${emp.lastName}` : "Deleted Employee"}
                        </span>
                        <span className="employee-id-sub">{emp.employeeId || "N/A"} - {emp.department || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{w.title}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "300px", wordBreak: "break-word" }}>{w.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getSeverityBadgeClass(w.severity)}`}>
                      {w.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${w.status === "Active" ? "badge-inactive" : "badge-active"}`}>
                      {w.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500 }}>{w.issuedByName}</span>
                      <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>{w.issuedByRole}</span>
                    </div>
                  </td>
                  <td>{formatDate(w.warningDate)}</td>
                  <td className="actions-cell">
                    {w.status === "Active" && (
                      <button
                        className="btn-icon-only success"
                        onClick={() => handleResolve(dbId)}
                        title="Mark as Resolved"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      className="btn-icon-only danger"
                      onClick={() => handleDeleteClick(dbId)}
                      title="Revoke / Delete Warning"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                <ShieldAlert size={40} style={{ display: "block", margin: "0 auto 1rem", opacity: 0.5 }} />
                No warnings registered in the system.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
