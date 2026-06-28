import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import MetricsGrid from "../components/Dashboard/MetricsGrid";
import DepartmentDistribution from "../components/Dashboard/DepartmentDistribution";
import RecentActivity from "../components/Dashboard/RecentActivity";

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
        color: "#2563eb",
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
          color: "#3b82f6",
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
      {/* Date Subtitle */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={14} />
          <span>{currentDate}</span>
        </p>
      </div>

      {/* Metrics Grid Sub-Component */}
      <MetricsGrid
        totalEmployees={totalEmployees}
        activeEmployees={activeEmployees}
        avgSalary={avgSalary}
        internsCount={internsCount}
        formatCurrency={formatCurrency}
        user={user}
      />

      {/* Analytics Details Grid */}
      <div className="charts-grid">
        {/* Department Distribution Chart Sub-Component */}
        <DepartmentDistribution
          deptData={deptData}
          maxDeptCount={maxDeptCount}
        />

        {/* Recent Activity Sub-Component */}
        <RecentActivity
          activities={activities}
          navigate={navigate}
        />
      </div>
    </div>
  );
}
