import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ChevronLeft, ChevronRight, User, CalendarCheck, AlertOctagon, CalendarRange, CalendarDays, Megaphone, LogOut, FolderOpen, Coins, Landmark, Settings, TrendingUp } from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  user,
  permissions = {},
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

        {user && (user.role === "Admin" || permissions.canViewEmployees || permissions.canManageEmployees) && (
          <NavLink
            to="/employees"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            end
            onClick={() => setMobileOpen && setMobileOpen(false)}
          >
            <Users size={20} />
            <span className="nav-text">Employees</span>
          </NavLink>
        )}

        <NavLink
          to="/attendance"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <CalendarCheck size={20} />
          <span className="nav-text">Attendance</span>
        </NavLink>

        <NavLink
          to="/warnings"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <AlertOctagon size={20} />
          <span className="nav-text">Warnings</span>
        </NavLink>

        <NavLink
          to="/leaves"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <CalendarRange size={20} />
          <span className="nav-text">Leaves</span>
        </NavLink>

        <NavLink
          to="/holidays"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <CalendarDays size={20} />
          <span className="nav-text">Holidays</span>
        </NavLink>

        <NavLink
          to="/announcements"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <Megaphone size={20} />
          <span className="nav-text">Announcements</span>
        </NavLink>

        <NavLink
          to="/resignations"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <LogOut size={20} />
          <span className="nav-text">Resignations</span>
        </NavLink>

        <NavLink
          to="/documents"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <FolderOpen size={20} />
          <span className="nav-text">Documents</span>
        </NavLink>

        <NavLink
          to="/payroll"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <Coins size={20} />
          <span className="nav-text">Payroll</span>
        </NavLink>

        <NavLink
          to="/bank-details"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobileOpen && setMobileOpen(false)}
        >
          <Landmark size={20} />
          <span className="nav-text">Bank Details</span>
        </NavLink>

        {user && (user.role === "Admin" || permissions.canManageEmployees) && (
          <NavLink
            to="/promotions"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setMobileOpen && setMobileOpen(false)}
          >
            <TrendingUp size={20} />
            <span className="nav-text">Promotions</span>
          </NavLink>
        )}

        {user && (user.role === "Admin" || permissions.canManageSettings) && (
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={() => setMobileOpen && setMobileOpen(false)}
          >
            <Settings size={20} />
            <span className="nav-text">Settings</span>
          </NavLink>
        )}
      </nav>

      <NavLink
        to="/profile"
        className="sidebar-footer"
        onClick={() => setMobileOpen && setMobileOpen(false)}
        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
      >
        <div className="user-avatar">
          <User size={18} />
        </div>
        <div className="user-info">
          <span className="user-name">{user && user.email ? user.email.split("@")[0] : "HR Manager"}</span>
          <span className="user-role">{user && user.role ? user.role : "Administrator"}</span>
        </div>
      </NavLink>
    </aside>
  );
}
