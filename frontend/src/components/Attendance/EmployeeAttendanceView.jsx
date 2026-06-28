import React from "react";
import { 
  Clock3, 
  Coffee, 
  CheckCircle, 
  UserCheck, 
  AlertCircle, 
  CalendarCheck, 
  Calendar 
} from "lucide-react";

export default function EmployeeAttendanceView({
  time,
  todayStatus,
  submitting,
  handleCheckIn,
  handleCheckOut,
  stats,
  history
}) {
  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Main Clock Card */}
      <div className="clock-widget glass-card">
        <div className="digital-clock">{formatTime(time)}</div>
        <div className="clock-date">{formatDate(time)}</div>
        
        <div className="clock-actions">
          <button 
            className="btn btn-clock btn-clock-in"
            disabled={submitting || !!todayStatus}
            onClick={() => handleCheckIn()}
          >
            <Clock3 size={24} />
            <span>Check In</span>
          </button>
          
          <button 
            className="btn btn-clock btn-clock-out"
            disabled={submitting || !todayStatus || !!todayStatus.checkOut}
            onClick={() => handleCheckOut()}
          >
            <Coffee size={24} />
            <span>Check Out</span>
          </button>
        </div>

        {/* Current Day Status Badge */}
        {todayStatus ? (
          todayStatus.checkOut ? (
            <div className="status-badge-inline checked-out">
              <CheckCircle size={14} />
              <span>Checked Out today at {todayStatus.checkOut}</span>
            </div>
          ) : (
            <div className="status-badge-inline checked-in">
              <UserCheck size={14} />
              <span>Checked In today at {todayStatus.checkIn}</span>
            </div>
          )
        ) : (
          <div className="status-badge-inline not-checked-in">
            <AlertCircle size={14} />
            <span>Not Checked In Today</span>
          </div>
        )}
      </div>

      {/* Personal stats grid */}
      <div className="stats-grid-attendance">
        <div className="glass-card stat-attendance-item">
          <span className="stat-attendance-label">Total Logs</span>
          <span className="stat-attendance-value">{stats.totalDays || 0}</span>
        </div>
        <div className="glass-card stat-attendance-item" style={{ borderLeft: "3px solid var(--success)" }}>
          <span className="stat-attendance-label">Days Present</span>
          <span className="stat-attendance-value">{stats.present || 0}</span>
        </div>
        <div className="glass-card stat-attendance-item" style={{ borderLeft: "3px solid var(--warning)" }}>
          <span className="stat-attendance-label">Half Days</span>
          <span className="stat-attendance-value">{stats.halfDay || 0}</span>
        </div>
      </div>

      {/* Personal Logs Table */}
      <div className="glass-card attendance-history-card">
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CalendarCheck size={18} style={{ color: "var(--primary)" }} />
          <span>Personal Attendance History</span>
        </h2>
        
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} style={{ color: "var(--text-secondary)" }} />
                        <span>{log.date}</span>
                      </div>
                    </td>
                    <td>{log.checkIn || "--"}</td>
                    <td>{log.checkOut || "--"}</td>
                    <td>
                      <span className={log.status === "Present" ? "badge-present" : log.status === "Half Day" ? "badge-half-day" : "badge-absent"}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No attendance history found. Check in to create your first log!
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
