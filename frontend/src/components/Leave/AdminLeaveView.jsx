import React, { useState } from "react";
import { Check, X, ShieldAlert, CalendarRange, Clock, ShieldCheck, XCircle } from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function AdminLeaveView({ leaves, handleApproveReject, formatDate }) {
  const [remarks, setRemarks] = useState({}); // state mapping leave._id to remark text input
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  // Compute stats
  const totalApplied = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;

  const handleRemarkChange = (id, val) => {
    setRemarks((prev) => ({ ...prev, [id]: val }));
  };

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

  // Extract unique departments from the leaves employee profiles
  const departments = ["All", ...new Set(leaves.map((l) => l.employee?.department).filter(Boolean))];

  // Filter leaves
  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    const matchesDept = deptFilter === "All" || l.employee?.department === deptFilter;
    return matchesStatus && matchesDept;
  });

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

      {/* Admin Operations Panel */}
      <div className="dashboard-card glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <h2 className="card-title">Leave Request Submissions</h2>
          
          {/* Filters */}
          <div className="filter-group">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Filter Status</label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Filter Department</label>
              <select
                className="filter-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Review Action / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((l) => {
                  const emp = l.employee || {};
                  const dbId = l._id || l.id;
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
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.leaveType}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{l.totalDays}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", maxWidth: "220px", wordBreak: "break-word" }}>
                          {l.reason}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(l.status)}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === "Pending" ? (
                          <div className="approval-panel">
                            <input
                              type="text"
                              className="approval-remark-input"
                              placeholder="Review remarks (optional)..."
                              value={remarks[dbId] || ""}
                              onChange={(e) => handleRemarkChange(dbId, e.target.value)}
                            />
                            <div className="approval-actions">
                              <button
                                className="btn btn-approve"
                                onClick={() => handleApproveReject(dbId, "Approved", remarks[dbId])}
                              >
                                <Check size={14} />
                                Approve
                              </button>
                              <button
                                className="btn btn-reject"
                                onClick={() => handleApproveReject(dbId, "Rejected", remarks[dbId])}
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
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
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                    <ShieldAlert size={40} style={{ display: "block", margin: "0 auto 1rem", opacity: 0.5 }} />
                    No leave requests match your criteria.
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
