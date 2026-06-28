import React from "react";

export default function RecentActivity({ activities, navigate }) {
  return (
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
  );
}
