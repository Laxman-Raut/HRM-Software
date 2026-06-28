import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarRange,
  Clock,
  TrendingUp,
  Award,
  Bell,
  ChevronRight,
  Zap,
  Shield,
  Star,
  Smile,
  Target,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Coffee,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

export default function EmployeeDashboardPage({ user, employees }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tick clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      setLoading(true);
      try {
        const [statsRes, historyRes, todayRes, leavesRes] = await Promise.all([
          fetch(`${API_BASE}/attendance/stats`, { headers }),
          fetch(`${API_BASE}/attendance/history`, { headers }),
          fetch(`${API_BASE}/attendance/today-status`, { headers }),
          fetch(`${API_BASE}/leaves`, { headers }),
        ]);

        const [statsJson, , todayJson, leavesJson] = await Promise.all([
          statsRes.json(),
          historyRes.json(),
          todayRes.json(),
          leavesRes.json(),
        ]);

        if (statsJson.success) setAttendanceStats(statsJson.data);
        if (todayJson.success) setTodayStatus(todayJson.data);
        if (leavesJson.success) setLeaves(leavesJson.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived data
  const profile = user || {};
  const firstName = profile.firstName || profile.email?.split("@")[0] || "Employee";
  const lastName = profile.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const department = profile.department || "—";
  const designation = profile.designation || "—";
  const joiningDate = profile.joiningDate
    ? new Date(profile.joiningDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  // Work tenure in months
  const tenureMonths = profile.joiningDate
    ? Math.floor((new Date() - new Date(profile.joiningDate)) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  const myLeaves = leaves.filter(
    (l) => l.employeeId === profile._id || l.employeeId?._id === profile._id
  );
  const pendingLeaves = myLeaves.filter((l) => l.status === "Pending").length;
  const approvedLeaves = myLeaves.filter((l) => l.status === "Approved").length;

  const greetingHour = time.getHours();
  const greeting =
    greetingHour < 12 ? "Good Morning" : greetingHour < 17 ? "Good Afternoon" : "Good Evening";

  const greetingEmoji =
    greetingHour < 12 ? "☀️" : greetingHour < 17 ? "⚡" : "🌙";

  const totalDays = attendanceStats?.totalDays || 0;
  const presentDays = attendanceStats?.present || 0;
  const halfDays = attendanceStats?.halfDay || 0;
  const absentDays = attendanceStats?.absent || 0;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const currentDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const isCheckedIn = todayStatus?.checkIn && !todayStatus?.checkOut;
  const isCheckedOut = todayStatus?.checkIn && todayStatus?.checkOut;

  // Quick actions
  const quickActions = [
    {
      id: "attendance",
      label: "Check In / Out",
      icon: <CalendarCheck size={22} />,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      path: "/attendance",
      desc: isCheckedIn ? "Currently checked in" : "Not checked in yet",
    },
    {
      id: "leaves",
      label: "Apply for Leave",
      icon: <CalendarRange size={22} />,
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      path: "/leaves",
      desc: `${pendingLeaves} pending request${pendingLeaves !== 1 ? "s" : ""}`,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <Shield size={22} />,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      path: "/employees",
      desc: "View & update details",
    },
  ];

  // Attendance ring percentage
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (attendancePct / 100) * circumference;

  return (
    <div className="emp-dash fade-in">
      {/* ── HERO HEADER ── */}
      <div className="emp-hero">
        {/* Left: Greeting & Profile */}
        <div className="emp-hero-left">
          <div className="emp-avatar-ring">
            <div className="emp-avatar-inner">
              {firstName.charAt(0).toUpperCase()}
              {lastName.charAt(0)?.toUpperCase()}
            </div>
            <div className="emp-avatar-status" title={isCheckedIn ? "Checked In" : "Offline"} />
          </div>

          <div className="emp-hero-info">
            <div className="emp-greeting">
              {greetingEmoji} {greeting},
            </div>
            <h1 className="emp-hero-name">{fullName}</h1>
            <div className="emp-hero-meta">
              <span className="emp-hero-badge">{designation}</span>
              <span className="emp-hero-dot">•</span>
              <span style={{ color: "var(--text-secondary)" }}>{department}</span>
            </div>
            <div className="emp-hero-sub">
              <span>📅 Joined {joiningDate}</span>
              {tenureMonths > 0 && (
                <span style={{ marginLeft: "1rem", color: "var(--text-muted)" }}>
                  · {tenureMonths >= 12
                    ? `${Math.floor(tenureMonths / 12)}y ${tenureMonths % 12}m tenure`
                    : `${tenureMonths}m tenure`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Clock & Date */}
        <div className="emp-hero-right">
          <div className="emp-clock-card">
            <div className="emp-clock-time">{currentTime}</div>
            <div className="emp-clock-date">{currentDate}</div>
            <div className={`emp-check-status ${isCheckedIn ? "status-in" : isCheckedOut ? "status-out" : "status-none"}`}>
              {isCheckedIn ? (
                <><CheckCircle size={14} /> Checked In</>
              ) : isCheckedOut ? (
                <><CheckCircle size={14} /> Checked Out</>
              ) : (
                <><AlertCircle size={14} /> Not Checked In</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ROW ── */}
      <div className="emp-kpi-grid">
        {/* Attendance Rate */}
        <div className="emp-kpi-card kpi-attendance">
          <div className="emp-kpi-header">
            <div className="emp-kpi-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
              <TrendingUp size={20} />
            </div>
            <span className="emp-kpi-label">Attendance Rate</span>
          </div>
          <div className="emp-kpi-body">
            <div className="emp-ring-container">
              <svg className="emp-ring-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  strokeDashoffset={circumference * 0.25}
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
                <text x="60" y="64" textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
                  {attendancePct}%
                </text>
              </svg>
            </div>
            <div className="emp-kpi-breakdown">
              <div className="emp-break-item">
                <span className="emp-break-dot" style={{ background: "#10b981" }} />
                <span>{presentDays} Present</span>
              </div>
              <div className="emp-break-item">
                <span className="emp-break-dot" style={{ background: "#f59e0b" }} />
                <span>{halfDays} Half-day</span>
              </div>
              <div className="emp-break-item">
                <span className="emp-break-dot" style={{ background: "#ef4444" }} />
                <span>{absentDays} Absent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="emp-kpi-card kpi-leaves">
          <div className="emp-kpi-header">
            <div className="emp-kpi-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1" }}>
              <CalendarRange size={20} />
            </div>
            <span className="emp-kpi-label">Leave Overview</span>
          </div>
          <div className="emp-kpi-body" style={{ flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Pending", val: pendingLeaves, color: "#f59e0b" },
              { label: "Approved", val: approvedLeaves, color: "#10b981" },
              { label: "Total Applied", val: myLeaves.length, color: "#6366f1" },
            ].map((item) => (
              <div key={item.label} className="emp-leave-row">
                <span className="emp-leave-label">{item.label}</span>
                <div className="emp-leave-pill" style={{ background: `${item.color}22`, color: item.color }}>
                  {item.val}
                </div>
              </div>
            ))}
            <button
              className="emp-leave-cta"
              onClick={() => navigate("/leaves")}
            >
              View All Leaves <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Today's Status */}
        <div className="emp-kpi-card kpi-today">
          <div className="emp-kpi-header">
            <div className="emp-kpi-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
              <Clock size={20} />
            </div>
            <span className="emp-kpi-label">Today's Session</span>
          </div>
          <div className="emp-kpi-body" style={{ flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
            {todayStatus?.checkIn ? (
              <>
                <div className="emp-session-row">
                  <span className="emp-session-key">Check In</span>
                  <span className="emp-session-val success">
                    {new Date(todayStatus.checkIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="emp-session-row">
                  <span className="emp-session-key">Check Out</span>
                  <span className="emp-session-val" style={{ color: todayStatus.checkOut ? "#10b981" : "var(--text-muted)" }}>
                    {todayStatus.checkOut
                      ? new Date(todayStatus.checkOut).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                </div>
                {todayStatus.checkIn && todayStatus.checkOut && (
                  <div className="emp-session-row">
                    <span className="emp-session-key">Duration</span>
                    <span className="emp-session-val" style={{ color: "#6366f1" }}>
                      {(() => {
                        const diff = new Date(todayStatus.checkOut) - new Date(todayStatus.checkIn);
                        const h = Math.floor(diff / 3600000);
                        const m = Math.floor((diff % 3600000) / 60000);
                        return `${h}h ${m}m`;
                      })()}
                    </span>
                  </div>
                )}
                <div className="emp-session-row">
                  <span className="emp-session-key">Status</span>
                  <span className={`badge ${todayStatus.status === "Present" ? "badge-active" : todayStatus.status === "Half Day" ? "badge-warning" : "badge-inactive"}`} style={{ fontSize: "0.72rem" }}>
                    {todayStatus.status || "—"}
                  </span>
                </div>
              </>
            ) : (
              <div className="emp-no-checkin">
                <Coffee size={32} style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }} />
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  No check-in recorded today
                </span>
                <button className="emp-checkin-btn" onClick={() => navigate("/attendance")}>
                  <Zap size={14} /> Go to Attendance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tenure / Achievements */}
        <div className="emp-kpi-card kpi-tenure">
          <div className="emp-kpi-header">
            <div className="emp-kpi-icon" style={{ background: "rgba(236,72,153,0.15)", color: "#ec4899" }}>
              <Award size={20} />
            </div>
            <span className="emp-kpi-label">Your Journey</span>
          </div>
          <div className="emp-kpi-body" style={{ flexDirection: "column", gap: "0.75rem" }}>
            <div className="emp-tenure-big">
              <span className="emp-tenure-num">
                {tenureMonths >= 12
                  ? Math.floor(tenureMonths / 12)
                  : tenureMonths}
              </span>
              <span className="emp-tenure-unit">
                {tenureMonths >= 12 ? "Years" : "Months"}
              </span>
            </div>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>with the company</span>
            <div className="emp-badges-row">
              {attendancePct >= 90 && (
                <div className="emp-badge-chip gold">
                  <Star size={12} /> Star Performer
                </div>
              )}
              {tenureMonths >= 12 && (
                <div className="emp-badge-chip purple">
                  <Shield size={12} /> 1-Year Club
                </div>
              )}
              {myLeaves.length === 0 && (
                <div className="emp-badge-chip green">
                  <Smile size={12} /> Zero Leaves
                </div>
              )}
              {attendancePct < 90 && tenureMonths < 12 && myLeaves.length > 0 && (
                <div className="emp-badge-chip blue">
                  <Target size={12} /> Keep Going!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LOWER ROW ── */}
      <div className="emp-lower-grid">
        {/* Quick Actions */}
        <div className="emp-section-card emp-actions-card">
          <div className="emp-section-header">
            <Zap size={18} style={{ color: "#6366f1" }} />
            <h2 className="emp-section-title">Quick Actions</h2>
          </div>
          <div className="emp-action-list">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="emp-action-item"
                onClick={() => navigate(action.path)}
              >
                <div className="emp-action-icon-wrap" style={{ background: action.gradient }}>
                  {action.icon}
                </div>
                <div className="emp-action-text">
                  <span className="emp-action-label">{action.label}</span>
                  <span className="emp-action-desc">{action.desc}</span>
                </div>
                <ChevronRight size={16} style={{ color: "var(--text-muted)", marginLeft: "auto" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Team Colleagues */}
        <div className="emp-section-card emp-team-card">
          <div className="emp-section-header">
            <BarChart2 size={18} style={{ color: "#10b981" }} />
            <h2 className="emp-section-title">Department Colleagues</h2>
          </div>
          <div className="emp-team-list">
            {employees
              .filter((e) => e.department === profile.department && e._id !== profile._id)
              .slice(0, 5)
              .map((emp) => (
                <div key={emp._id} className="emp-team-item">
                  <div className="emp-team-avatar">
                    {emp.firstName?.charAt(0)}
                    {emp.lastName?.charAt(0)}
                  </div>
                  <div className="emp-team-info">
                    <span className="emp-team-name">
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="emp-team-role">{emp.designation}</span>
                  </div>
                  <span
                    className={`badge ${emp.employmentStatus === "Active" ? "badge-active" : "badge-inactive"}`}
                    style={{ fontSize: "0.68rem" }}
                  >
                    {emp.employmentStatus}
                  </span>
                </div>
              ))}
            {employees.filter((e) => e.department === profile.department && e._id !== profile._id).length === 0 && (
              <div className="emp-empty-team">
                <Smile size={30} style={{ color: "var(--text-muted)" }} />
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  No other team members found
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="emp-section-card emp-leave-history-card">
          <div className="emp-section-header">
            <Bell size={18} style={{ color: "#f59e0b" }} />
            <h2 className="emp-section-title">Recent Requests</h2>
          </div>
          <div className="emp-leave-history-list">
            {myLeaves.slice(0, 5).map((leave) => (
              <div key={leave._id} className="emp-leave-hist-item">
                <div className="emp-leave-hist-left">
                  <span className="emp-leave-hist-type">{leave.leaveType || "Leave"}</span>
                  <span className="emp-leave-hist-dates">
                    {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" "}→{" "}
                    {new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <span
                  className={`badge ${leave.status === "Approved" ? "badge-active" : leave.status === "Rejected" ? "badge-inactive" : "badge-warning"}`}
                  style={{ fontSize: "0.68rem" }}
                >
                  {leave.status}
                </span>
              </div>
            ))}
            {myLeaves.length === 0 && (
              <div className="emp-empty-team">
                <CalendarRange size={30} style={{ color: "var(--text-muted)" }} />
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  No leave requests yet
                </span>
                <button className="emp-checkin-btn" onClick={() => navigate("/leaves")}>
                  Apply for Leave
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
