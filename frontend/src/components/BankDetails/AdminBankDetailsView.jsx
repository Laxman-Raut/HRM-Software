import React, { useState } from "react";
import { Check, X, Search, Landmark, ShieldCheck, ShieldAlert, CreditCard } from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function AdminBankDetailsView({ bankDetailsList, onVerify, onReject, isUpdatingId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredList = bankDetailsList.filter((item) => {
    const employee = item.employee || {};
    const firstName = employee.firstName || "";
    const lastName = employee.lastName || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const empId = (employee.employeeId || "").toLowerCase();
    const dept = (employee.department || "").toLowerCase();

    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      empId.includes(searchTerm.toLowerCase()) ||
      dept.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Verified":
        return "badge-active";
      case "Rejected":
        return "badge-inactive";
      case "Pending":
      default:
        return "badge-warning";
    }
  };

  return (
    <div className="fade-in" style={{ marginTop: "1rem" }}>
      {/* Search & Filter Toolbar */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.5rem", 
          gap: "1rem", 
          flexWrap: "wrap" 
        }}
      >
        <div style={{ position: "relative", flex: "1", maxWidth: "360px" }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)" 
            }} 
          />
          <input
            type="text"
            placeholder="Search by name, ID or department..."
            className="form-control"
            style={{ paddingLeft: "38px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Status:</span>
          <select
            className="form-control"
            style={{ width: "150px", cursor: "pointer" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Bank / Branch</th>
              <th>Account Details</th>
              <th>Account Type</th>
              <th>UPI ID</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((item) => {
                const emp = item.employee || {};
                const dbId = item._id || item.id;
                const isProcessing = isUpdatingId === dbId;

                return (
                  <tr key={dbId}>
                    <td>
                      <div className="employee-profile">
                        <EmployeeAvatar emp={emp} />
                        <div className="employee-info-cell">
                          <span className="employee-name">
                            {emp.firstName ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
                          </span>
                          <span className="employee-id-sub">
                            {emp.employeeId || "N/A"} - {emp.department || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.bankName}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.branchName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                          {"•••• " + (item.accountNumber ? item.accountNumber.slice(-4) : "••••")}
                        </span>
                        <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                          IFSC: {item.ifscCode}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem" }}>{item.accountType}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem", color: item.upiId ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {item.upiId || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {item.status === "Pending" ? (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            className="btn-icon-only success"
                            onClick={() => onVerify(dbId)}
                            title="Verify Bank Details"
                            disabled={isProcessing}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn-icon-only danger"
                            onClick={() => onReject(dbId)}
                            title="Reject Bank Details"
                            disabled={isProcessing}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : item.status === "Verified" ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.25rem", justifyContent: "flex-end", paddingRight: "0.5rem" }}>
                          <ShieldCheck size={14} /> Verified
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.25rem", justifyContent: "flex-end", paddingRight: "0.5rem" }}>
                          <ShieldAlert size={14} /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "3.5rem", color: "var(--text-secondary)" }}>
                  <CreditCard size={40} style={{ display: "block", margin: "0 auto 1rem", opacity: 0.5 }} />
                  {bankDetailsList.length === 0 
                    ? "No employee bank details submitted yet."
                    : "No bank details matches your search criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
