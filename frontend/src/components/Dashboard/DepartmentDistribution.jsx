import React from "react";
import { Users } from "lucide-react";

export default function DepartmentDistribution({ deptData, maxDeptCount }) {
  return (
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
  );
}
