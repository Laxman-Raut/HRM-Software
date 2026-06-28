import React from "react";
import { X } from "lucide-react";

export default function ManualAttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  employees,
  employeeId,
  setEmployeeId,
  actionType,
  setActionType
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        zIndex: 1100 
      }}
    >
      <div 
        className="modal-content glass-card fade-in" 
        style={{ 
          maxWidth: "480px", 
          width: "100%", 
          padding: "2rem", 
          position: "relative" 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-btn"
          style={{ 
            position: "absolute", 
            top: "1rem", 
            right: "1rem", 
            background: "none", 
            border: "none", 
            color: "var(--text-secondary)", 
            cursor: "pointer" 
          }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h3 className="modal-title" style={{ fontFamily: "var(--font-heading)", marginBottom: "1.5rem" }}>
          Mark Employee Attendance
        </h3>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select
              className="form-control"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  [{emp.employeeId}] {emp.firstName} {emp.lastName} - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Action Type</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name="manualType" 
                  value="in" 
                  checked={actionType === "in"} 
                  onChange={() => setActionType("in")} 
                />
                <span>Clock In (Check-In)</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name="manualType" 
                  value="out" 
                  checked={actionType === "out"} 
                  onChange={() => setActionType("out")} 
                />
                <span>Clock Out (Check-Out)</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "1rem" }}
          >
            Submit Attendance Log
          </button>
        </form>
      </div>
    </div>
  );
}
