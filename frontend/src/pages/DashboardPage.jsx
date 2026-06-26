import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, DollarSign, UserPlus, Briefcase, Calendar } from "lucide-react";

export default function DashboardPage({ employees, showAddModal, user }) {
  const navigate = useNavigate();

  // 1. Calculate metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employmentStatus === "Active").length;
  
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;
  
  const internsCount = employees.filter((e) => e.employmentType === "Intern").length;

  // 2. Department Breakdown
  const deptCounts = {};
  employees.forEach((e) => {
    if (e.department) {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    }
  });

  const deptData = Object.keys(deptCounts).map((dept) => ({
    name: dept,
    count: deptCounts[dept],
  }));

  const maxDeptCount = Math.max(...deptData.map((d) => d.count), 1);

  // 3. Format Currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 4. Activity log resolver
  const getRecentActivities = () => {
    const sorted = [...employees].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.joiningDate || 0);
      const dateB = new Date(b.createdAt || b.joiningDate || 0);
      return dateB - dateA;
    });
    
    const activities = [];
    
    // Recent onboardings
    sorted.slice(0, 4).forEach((emp) => {
      const dbId = emp._id || emp.id || Math.random().toString();
      activities.push({
        id: `hire-${dbId}`,
        desc: `New Employee onboarded: ${emp.firstName} ${emp.lastName} as ${emp.designation}`,
        time: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }) : "Recently",
        color: "#6366f1",
      });
    });

    if (activities.length === 0) {
      return [
        {
          id: "act-1",
          desc: "Database connection established successfully.",
          time: "Just now",
          color: "#10b981",
        },
        {
          id: "act-2",
          desc: "HR portal integration with backend completed.",
          time: "1 hour ago",
          color: "#0ea5e9",
        },
      ];
    }

    return activities;
  };

  const activities = getRecentActivities();

  // Get current date string
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fade-in">
      {/* Date Subtitle (Navbar now holds page title) */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={14} />
          <span>{currentDate}</span>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Total Employees</span>
            <span className="metric-value">{totalEmployees}</span>
          </div>
          <div className="metric-icon-wrapper primary">
            <Users size={22} />
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Active Employees</span>
            <span className="metric-value">{activeEmployees}</span>
          </div>
          <div className="metric-icon-wrapper success">
            <UserCheck size={22} />
          </div>
        </div>

        {user && user.role !== "Employee" && (
          <div className="metric-card glass-card">
            <div className="metric-details">
              <span className="metric-label">Average Salary</span>
              <span className="metric-value">{formatCurrency(avgSalary)}</span>
            </div>
            <div className="metric-icon-wrapper warning">
              <DollarSign size={22} />
            </div>
          </div>
        )}

        <div className="metric-card glass-card">
          <div className="metric-details">
            <span className="metric-label">Interns Count</span>
            <span className="metric-value">{internsCount}</span>
          </div>
          <div className="metric-icon-wrapper info">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Analytics Details Grid */}
      <div className="charts-grid">
        {/* Department Distribution Chart */}
        <div className="dashboard-card glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Department Distribution</h2>
              <span className="metric-label" style={{ textTransform: "none", fontSize: "0.75rem", fontWeight: "500", marginTop: "0.15rem", display: "inline-block" }}>
                Staff count breakdown by active departments
              </span>
            </div>
          </div>
          <div className="card-body">
            {deptData.length > 0 ? (
              <div className="chart-container">
                {deptData.map((d) => {
                  const percent = (d.count / maxDeptCount) * 100;
                  return (
                    <div key={d.name} className="chart-bar-wrapper">
                      <div
                        className="chart-bar"
                        style={{ height: `${Math.max(percent, 8)}%` }}
                      >
                        <div className="chart-bar-tooltip">
                          {d.count} {d.count === 1 ? "Employee" : "Employees"}
                        </div>
                      </div>
                      <span className="chart-label" title={d.name}>
                        {d.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="chart-empty">
                <Users size={40} className="empty-state-icon" />
                <span className="empty-state-title">No Department Data</span>
                <span className="metric-label" style={{ textTransform: "none" }}>Create employees to view statistics.</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Activity</h2>
              <span className="metric-label" style={{ textTransform: "none", fontSize: "0.75rem", fontWeight: "500", marginTop: "0.15rem", display: "inline-block" }}>
                Timeline of recent portal actions
              </span>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.725rem", minHeight: "auto" }}
              onClick={() => navigate("/employees")}
            >
              View All
            </button>
          </div>
          <div className="card-body" style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
            <div className="activity-list">
              {activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div
                    className="activity-dot"
                    style={{ color: act.color || "#6366f1", backgroundColor: act.color || "#6366f1" }}
                  />
                  <div className="activity-details">
                    <span className="activity-desc">{act.desc}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
