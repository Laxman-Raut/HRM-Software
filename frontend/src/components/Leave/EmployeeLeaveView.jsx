import React from "react";
import { CalendarRange, Clock, ShieldCheck, XCircle } from "lucide-react";

export default function EmployeeLeaveView({ leaves, formatDate }) {
  // Compute leave stats
  const totalApplied = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "badge-approved";
      case "Rejected":
        return "badge-rejected";
      case "Pending":
      default:
        return "badge-pending";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Leave Stats Cards */}
      <div className="leave-stats-grid">
        <div className="leave-stat-card glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="leave-stat-label">Total Applied</span>
            <CalendarRange size={18} style={{ color: "var(--primary)", opacity: 0.8 }} />
          </div>
          <span className="leave-stat-value">{totalApplied}</span>
        </div>

        <div className="leave-stat-card glass-card pending">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="leave-stat-label">Pending Approval</span>
            <Clock size={18} style={{ color: "var(--warning)", opacity: 0.8 }} />
          </div>
          <span className="leave-stat-value">{pendingCount}</span>
        </div>

        <div className="leave-stat-card glass-card approved">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="leave-stat-label">Approved Leaves</span>
            <ShieldCheck size={18} style={{ color: "var(--success)", opacity: 0.8 }} />
          </div>
          <span className="leave-stat-value">{approvedCount}</span>
        </div>

        <div className="leave-stat-card glass-card rejected">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="leave-stat-label">Rejected Requests</span>
            <XCircle size={18} style={{ color: "var(--danger)", opacity: 0.8 }} />
          </div>
          <span className="leave-stat-value">{rejectedCount}</span>
        </div>
      </div>

      {/* History Table */}
      <div className="dashboard-card glass-card" style={{ padding: "1.5rem" }}>
        <h2 className="card-title" style={{ marginBottom: "1rem" }}>My Leave Requests</h2>
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="employee-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Approver / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((l) => (
                  <tr key={l._id || l.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {l.leaveType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {formatDate(l.startDate)} - {formatDate(l.endDate)}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{l.totalDays}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", maxWidth: "250px", wordBreak: "break-word" }}>
                        {l.reason}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status !== "Pending" ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-primary)" }}>
                            Audited by: {l.approvedByName || "Admin"} ({l.approvedByRole})
                          </span>
                          {l.remark && (
                            <span className="remark-text">
                              " {l.remark} "
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.775rem", fontStyle: "italic" }}>
                          Awaiting review
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    No leave requests applied yet. Click "Apply for Leave" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
