import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ChevronLeft, ChevronRight, User } from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  user,
}) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Users size={20} />
          </div>
          <span className="logo-text">HRM Portal</span>
        </div>
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <LayoutDashboard size={20} />
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/employees"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          end
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <Users size={20} />
          <span className="nav-text">Employees</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">
          <User size={18} />
        </div>
        <div className="user-info">
          <span className="user-name">{user && user.email ? user.email.split("@")[0] : "HR Manager"}</span>
          <span className="user-role">{user && user.role ? user.role : "Administrator"}</span>
        </div>
      </div>
    </aside>
  );
}
