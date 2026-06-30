import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  UserCheck,
  DollarSign,
  Briefcase,
  Clock,
  AlertOctagon,
  CalendarRange,
  Check,
  X,
  Plus,
  ArrowRight,
  Loader2,
  AlertTriangle
} from "lucide-react";
import EmployeeAvatar from "../components/Common/EmployeeAvatar";
import "./DashboardPage.css";

import { BASE_URL } from "../config";
const LEAVES_API = `${BASE_URL}/api/leaves`;
const WARNINGS_API = `${BASE_URL}/api/warnings`;
const ATTENDANCE_API = `${BASE_URL}/api/attendance/stats`;

export default function DashboardPage({ employees, showAddModal, user }) {
  const navigate = useNavigate();

  // Local data states
  const [leaves, setLeaves] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalActiveEmployees: 0,
    presentToday: 0,
    halfDayToday: 0,
    absentToday: 0,
    checkedInToday: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  // Fetch dashboard supplementary data
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [leavesRes, warningsRes, attendanceRes] = await Promise.all([
        fetch(LEAVES_API, { headers }),
        fetch(WARNINGS_API, { headers }),
        fetch(ATTENDANCE_API, { headers })
      ]);

      if (leavesRes.ok) {
        const leavesJson = await leavesRes.json();
        if (leavesJson.success) setLeaves(leavesJson.data || []);
      }

      if (warningsRes.ok) {
        const warningsJson = await warningsRes.json();
        if (warningsJson.success) setWarnings(warningsJson.data || []);
      }

      if (attendanceRes.ok) {
        const attendanceJson = await attendanceRes.json();
        if (attendanceJson.success) setAttendanceStats(attendanceJson.data || {});
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Leave approval / rejection
  const handleLeaveAction = async (id, status) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${LEAVES_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, remark: "Handled from Dashboard" })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      } else {
        alert(data.message || "Failed to update leave status");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Failed to update leave.");
    }
  };

  // Warning resolution
  const handleWarningResolve = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${WARNINGS_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Resolved" })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setWarnings(prev => prev.map(w => (w._id === id || w.id === id) ? { ...w, status: "Resolved" } : w));
      } else {
        alert(data.message || "Failed to resolve warning");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Failed to resolve warning.");
    }
  };

  // 1. Calculate static metrics from employees array
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employmentStatus === "Active").length;
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;
  const internsCount = employees.filter((e) => e.employmentType === "Intern").length;

  // 2. Department Distribution
  const deptCounts = {};
  employees.forEach((e) => {
    if (e.department) {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    }
  });

  const deptData = Object.keys(deptCounts)
    .map((dept) => ({
      name: dept,
      count: deptCounts[dept]
    }))
    .sort((a, b) => b.count - a.count); // sort by count desc

  const maxDeptCount = Math.max(...deptData.map((d) => d.count), 1);

  // 3. Format Currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get pending items counts
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const pendingLeavesCount = pendingLeaves.length;
  
  const activeWarnings = warnings.filter((w) => w.status === "Active");

  // Attendance metrics
  const totalActiveStaff = attendanceStats.totalActiveEmployees || activeEmployees || totalEmployees;
  const checkedInToday = attendanceStats.checkedInToday || 0;
  const attendanceRate = totalActiveStaff > 0 ? Math.round((checkedInToday / totalActiveStaff) * 100) : 0;

  // Attendance Donut Circle calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const userDisplayName = user ? (user.name || user.email.split("@")[0]) : "HR Manager";

  return (
    <div className="fade-in">
      {/* 1. Header Welcome & Action Panel */}
      <div className="dashboard-header-panel">
        <div className="header-welcome-text">
          <h1>{getGreeting()}, {userDisplayName}</h1>
          <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <Calendar size={14} style={{ color: "var(--primary)" }} />
            <span>{currentDate}</span>
          </p>
        </div>

        <div className="quick-actions-toolbar">
          <button className="quick-action-btn primary-action" onClick={showAddModal}>
            <Plus size={16} />
            <span>Onboard Employee</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/attendance")}>
            <UserCheck size={16} />
            <span>Record Attendance</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/leaves")}>
            <CalendarRange size={16} />
            <span>Manage Leaves</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate("/warnings")}>
            <AlertOctagon size={16} />
            <span>Issue Warning</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="metrics-row">
        {/* Metric Card 1: Total Employees */}
        <div className="enhanced-metric-card">
          <div className="metric-card-top">
            <span className="metric-card-title">Total Employees</span>
            <div className="metric-icon-box blue">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-card-bottom">
            <span className="metric-card-value">{totalEmployees}</span>
            <span className="metric-card-meta">
              <span>{activeEmployees} Active | {internsCount} Interns</span>
            </span>
          </div>
        </div>

        {/* Metric Card 2: Attendance Rate */}
        <div className="enhanced-metric-card">
          <div className="metric-card-top">
            <span className="metric-card-title">Attendance Rate</span>
            <div className="metric-icon-box green">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="metric-card-bottom">
            <span className="metric-card-value">{attendanceRate}%</span>
            <span className="metric-card-meta">
              <span>{checkedInToday} of {totalActiveStaff} checked in today</span>
            </span>
            <div className="metric-progress-wrapper">
              <div
                className="metric-progress-fill"
                style={{ width: `${attendanceRate}%`, backgroundColor: "#10b981" }}
              />
            </div>
          </div>
        </div>

        {/* Metric Card 3: Pending Leaves */}
        <div className="enhanced-metric-card">
          <div className="metric-card-top">
            <span className="metric-card-title">Pending Leaves</span>
            <div className="metric-icon-box amber">
              <CalendarRange size={20} />
            </div>
          </div>
          <div className="metric-card-bottom">
            <span className="metric-card-value">{pendingLeavesCount}</span>
            <span className="metric-card-meta">
              <span>Requires attention/approval</span>
            </span>
            <div className="metric-progress-wrapper">
              <div
                className="metric-progress-fill"
                style={{
                  width: `${Math.min((pendingLeavesCount / Math.max(leaves.length, 1)) * 100, 100)}%`,
                  backgroundColor: "#f59e0b"
                }}
              />
            </div>
          </div>
        </div>

        {/* Metric Card 4: Average Salary */}
        {user && user.role !== "Employee" && (
          <div className="enhanced-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-title">Average Salary</span>
              <div className="metric-icon-box purple">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="metric-card-bottom">
              <span className="metric-card-value">{formatCurrency(avgSalary)}</span>
              <span className="metric-card-meta">
                <span>Monthly average per capita</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Analytics & Visuals Section */}
      <div className="dashboard-grid-two-col">
        {/* Department Distribution */}
        <div className="dashboard-card-interactive">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-group">
              <h2 className="dashboard-card-title">
                <Briefcase size={18} style={{ color: "var(--primary)" }} />
                <span>Department Breakdown</span>
              </h2>
              <span className="dashboard-card-subtitle">Staff count distribution by business units</span>
            </div>
          </div>
          <div className="dashboard-card-body">
            {deptData.length > 0 ? (
              <div className="dept-distribution-list">
                {deptData.slice(0, 5).map((d) => {
                  const percent = Math.round((d.count / totalEmployees) * 100);
                  return (
                    <div key={d.name} className="dept-dist-row">
                      <div className="dept-dist-info">
                        <span className="dept-dist-name">{d.name}</span>
                        <span className="dept-dist-count">{d.count} {d.count === 1 ? "Staff" : "Staff"} ({percent}%)</span>
                      </div>
                      <div className="dept-dist-progress-track">
                        <div
                          className="dept-dist-progress-bar"
                          style={{ width: `${(d.count / maxDeptCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="inbox-empty">
                <Users size={32} className="inbox-empty-icon" />
                <span className="inbox-empty-text">No Department Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Today's Attendance Gauge */}
        <div className="dashboard-card-interactive">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-group">
              <h2 className="dashboard-card-title">
                <UserCheck size={18} style={{ color: "#10b981" }} />
                <span>Today's Attendance Status</span>
              </h2>
              <span className="dashboard-card-subtitle">Live checkpoint rate breakdown</span>
            </div>
          </div>
          <div className="dashboard-card-body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="attendance-donut-container">
              <div className="attendance-visual-circle">
                <svg className="attendance-circle-svg">
                  <circle cx="65" cy="65" r={radius} className="attendance-circle-bg" />
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    className="attendance-circle-fill"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset,
                      stroke: "#10b981"
                    }}
                  />
                </svg>
                <div className="attendance-circle-text-wrapper">
                  <span className="attendance-circle-percentage">{attendanceRate}%</span>
                  <span className="attendance-circle-label">Present</span>
                </div>
              </div>

              <div className="attendance-breakdown-legend">
                <div className="legend-item">
                  <span className="legend-color-label">
                    <span className="legend-dot present" />
                    <span>Present</span>
                  </span>
                  <span className="legend-value">{attendanceStats.presentToday || 0}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color-label">
                    <span className="legend-dot halfday" />
                    <span>Half Day</span>
                  </span>
                  <span className="legend-value">{attendanceStats.halfDayToday || 0}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color-label">
                    <span className="legend-dot absent" />
                    <span>Absent</span>
                  </span>
                  <span className="legend-value">{attendanceStats.absentToday || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Inbox / Lists */}
      <div className="dashboard-grid-two-col">
        {/* Leaves Pending Approval */}
        <div className="dashboard-card-interactive">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-group">
              <h2 className="dashboard-card-title">
                <Clock size={18} style={{ color: "var(--warning)" }} />
                <span>Pending Leave Approvals</span>
              </h2>
              <span className="dashboard-card-subtitle">Employee requests awaiting status updates</span>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", minHeight: "auto" }}
              onClick={() => navigate("/leaves")}
            >
              <span>View All</span>
              <ArrowRight size={12} style={{ marginLeft: "0.25rem" }} />
            </button>
          </div>
          <div className="dashboard-card-body">
            {loadingData ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <Loader2 className="spinner" size={24} />
              </div>
            ) : pendingLeaves.length > 0 ? (
              <div className="inbox-list">
                {pendingLeaves.slice(0, 3).map((l) => {
                  const emp = l.employee || {};
                  return (
                    <div key={l._id} className="inbox-item">
                      <div className="inbox-item-details">
                        <div className="inbox-item-avatar-wrapper">
                          <EmployeeAvatar emp={emp} className="employee-avatar small" style={{ width: "34px", height: "34px" }} />
                        </div>
                        <div className="inbox-item-info">
                          <span className="inbox-item-title">
                            {emp.firstName ? `${emp.firstName} ${emp.lastName}` : "Employee"}
                          </span>
                          <span className="inbox-item-desc" title={l.reason}>
                            {l.type} - {l.reason || "No reason provided"}
                          </span>
                          <span className="inbox-item-meta">
                            <span>{formatDate(l.startDate)} to {formatDate(l.endDate)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="inbox-item-actions">
                        <button
                          className="inbox-action-btn approve-btn"
                          onClick={() => handleLeaveAction(l._id, "Approved")}
                          title="Approve Leave"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="inbox-action-btn reject-btn"
                          onClick={() => handleLeaveAction(l._id, "Rejected")}
                          title="Reject Leave"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="inbox-empty">
                <Check className="inbox-empty-icon" size={32} style={{ color: "#10b981", opacity: 0.8 }} />
                <span className="inbox-empty-text">No Pending Leaves</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  All employee requests are processed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Warnings Inbox */}
        <div className="dashboard-card-interactive">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-group">
              <h2 className="dashboard-card-title">
                <AlertTriangle size={18} style={{ color: "var(--danger)" }} />
                <span>Active Warning Tracks</span>
              </h2>
              <span className="dashboard-card-subtitle">Active behavioral alerts requiring follow-up</span>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", minHeight: "auto" }}
              onClick={() => navigate("/warnings")}
            >
              <span>View All</span>
              <ArrowRight size={12} style={{ marginLeft: "0.25rem" }} />
            </button>
          </div>
          <div className="dashboard-card-body">
            {loadingData ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <Loader2 className="spinner" size={24} />
              </div>
            ) : activeWarnings.length > 0 ? (
              <div className="inbox-list">
                {activeWarnings.slice(0, 3).map((w) => {
                  const emp = w.employee || {};
                  const dbId = w._id || w.id;
                  const severityColors = {
                    High: "#ef4444",
                    Medium: "#f59e0b",
                    Low: "#10b981"
                  };
                  return (
                    <div key={dbId} className="inbox-item">
                      <div className="inbox-item-details">
                        <div className="inbox-item-avatar-wrapper">
                          <EmployeeAvatar emp={emp} className="employee-avatar small" style={{ width: "34px", height: "34px" }} />
                        </div>
                        <div className="inbox-item-info">
                          <span className="inbox-item-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>{emp.firstName ? `${emp.firstName} ${emp.lastName}` : "Employee"}</span>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                padding: "0.1rem 0.4rem",
                                borderRadius: "4px",
                                backgroundColor: `rgba(${w.severity === "High" ? "239, 68, 68" : w.severity === "Medium" ? "245, 158, 11" : "16, 185, 129"}, 0.08)`,
                                color: severityColors[w.severity] || "var(--primary)"
                              }}
                            >
                              {w.severity}
                            </span>
                          </span>
                          <span className="inbox-item-desc" title={w.description}>
                            {w.title} - {w.description}
                          </span>
                          <span className="inbox-item-meta">
                            <span>Issued by {w.issuedByName} on {formatDate(w.warningDate)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="inbox-item-actions">
                        <button
                          className="inbox-action-btn resolve-btn"
                          onClick={() => handleWarningResolve(dbId)}
                          title="Mark as Resolved"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="inbox-empty">
                <Check className="inbox-empty-icon" size={32} style={{ color: "#10b981", opacity: 0.8 }} />
                <span className="inbox-empty-text">No Active Warnings</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Staff compliance record is clean
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
