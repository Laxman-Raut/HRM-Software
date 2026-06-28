import React from "react";
import { 
  Users, 
  Clock3, 
  UserCheck, 
  AlertCircle, 
  CalendarCheck, 
  Plus, 
  Search, 
  Calendar 
} from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function AdminAttendanceView({
  stats,
  history,
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  selectedDate,
  setSelectedDate,
  setShowModal
}) {
  // Filtered History for Admin View
  const filteredHistory = history.filter((log) => {
    // 1. Filter by selected date
    const matchesDate = log.date === selectedDate;
    
    // 2. Filter by Search (name or ID)
    const emp = log.employee || {};
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      (emp.firstName && emp.firstName.toLowerCase().includes(searchLower)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(searchLower)) ||
      (log.employeeId && log.employeeId.toLowerCase().includes(searchLower));
      
    // 3. Filter by department
    const matchesDept = 
      selectedDept === "All" || 
      (emp.department && emp.department === selectedDept);

    return matchesDate && matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Admin Stats Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Active Staff</span>
            <span className="metric-value">{stats.totalActiveEmployees || 0}</span>
          </div>
          <div className="metric-icon-wrapper info">
            <Users size={22} />
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Checked In Today</span>
            <span className="metric-value">{stats.checkedInToday || 0}</span>
          </div>
          <div className="metric-icon-wrapper primary">
            <Clock3 size={22} />
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Present Today</span>
            <span className="metric-value">{stats.presentToday || 0}</span>
          </div>
          <div className="metric-icon-wrapper success">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Absent Today</span>
            <span className="metric-value">{stats.absentToday || 0}</span>
          </div>
          <div className="metric-icon-wrapper danger">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Master logs table and filters */}
      <div className="glass-card attendance-history-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <CalendarCheck size={18} style={{ color: "var(--primary)" }} />
            <span>Daily Attendance Logs</span>
          </h2>
          
          <button 
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Mark Attendance</span>
          </button>
        </div>

        {/* Filter controls row */}
        <div className="filters-row">
          <div className="filter-input-group">
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Search Employee</label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: "2.2rem" }}
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-input-group" style={{ maxWidth: "240px" }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Filter Department</label>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Accounts">Accounts</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="filter-input-group" style={{ maxWidth: "200px" }}>
            <label className="form-label" style={{ fontSize: "0.75rem" }}>Select Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="employee-info-cell">
                        <EmployeeAvatar emp={log.employee} className="employee-avatar-sm" />
                        <div className="employee-meta-text">
                          <span className="employee-meta-name">
                            {log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : "Deleted Employee"}
                          </span>
                          <span className="employee-meta-dept">
                            {log.employee ? log.employee.department : "--"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{log.employeeId}</td>
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
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <AlertCircle size={28} style={{ color: "var(--text-muted)" }} />
                      <span>No attendance logs found for this date & filters.</span>
                    </div>
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
