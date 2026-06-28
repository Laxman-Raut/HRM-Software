import React from "react";
import { Users, UserCheck, DollarSign, Briefcase } from "lucide-react";

export default function MetricsGrid({ totalEmployees, activeEmployees, avgSalary, internsCount, formatCurrency, user }) {
  return (
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
  );
}
