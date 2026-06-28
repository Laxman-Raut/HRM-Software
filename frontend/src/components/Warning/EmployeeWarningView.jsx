import React from "react";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export default function EmployeeWarningView({ warnings, formatDate }) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
      {warnings.length > 0 ? (
        warnings.map((w) => (
          <div 
            key={w._id || w.id} 
            className="dashboard-card glass-card" 
            style={{ 
              padding: "1.5rem", 
              borderLeft: `4px solid ${w.status === "Active" ? (w.severity === "High" ? "var(--danger)" : "var(--warning)") : "var(--success)"}` 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", width: "100%", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                {w.status === "Active" ? (
                  <AlertTriangle size={24} style={{ color: w.severity === "High" ? "var(--danger)" : "var(--warning)", marginTop: "0.25rem" }} />
                ) : (
                  <CheckCircle size={24} style={{ color: "var(--success)", marginTop: "0.25rem" }} />
                )}
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-primary)" }}>
                    <span>{w.title}</span>
                    <span className={`badge ${w.status === "Active" ? "badge-inactive" : "badge-active"}`} style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
                      {w.status}
                    </span>
                  </h3>
                  <p style={{ margin: "0.5rem 0", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                    {w.description}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                    Issued by: <strong>{w.issuedByName} ({w.issuedByRole})</strong>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                <span className={`badge ${getSeverityBadgeClass(w.severity)}`}>
                  {w.severity} Severity
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {formatDate(w.warningDate)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="dashboard-card glass-card" style={{ padding: "3rem", textAlign: "center", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={48} style={{ color: "var(--success)", marginBottom: "1rem", opacity: 0.8 }} />
          <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>No Active Warnings</h3>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
            Great job! You have no policy violations or active warnings on record.
          </p>
        </div>
      )}
    </div>
  );
}
