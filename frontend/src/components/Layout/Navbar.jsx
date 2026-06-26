import React from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon, User, Bell, LogOut, Menu } from "lucide-react";

export default function Navbar({ darkMode, setDarkMode, onLogout, setMobileOpen, user }) {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) {
      return "Dashboard Overview";
    }
    if (path.match(/\/employees\/[a-zA-Z0-9_-]+/)) {
      return "Employee Profile Details";
    }
    if (path.includes("/employees")) {
      return "Employee Directory";
    }
    return "HRM Portal";
  };

  return (
    <header className="global-navbar glass-card">
      <div className="navbar-left">
        <button 
          className="navbar-action-btn mobile-menu-toggle" 
          onClick={() => setMobileOpen(true)}
          title="Open Menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="navbar-title">{getPageTitle()}</h2>
      </div>

      <div className="navbar-right">
        {/* Notifications Icon */}
        <button className="navbar-action-btn" title="Notifications">
          <Bell size={18} />
        </button>

        {/* Theme Toggle Button */}
        <button
          className="navbar-action-btn theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Logout Button */}
        <button
          className="navbar-action-btn logout-btn"
          onClick={onLogout}
          title="Sign Out"
        >
          <LogOut size={18} style={{ color: "var(--danger)" }} />
        </button>

        {/* Profile Avatar */}
        <div className="navbar-profile">
          <div className="navbar-avatar">
            <User size={16} />
          </div>
          <div className="navbar-user-details">
            <span className="navbar-username">{user && user.email ? user.email.split("@")[0] : "HR Manager"}</span>
            <span className="navbar-userrole">{user && user.role ? user.role : "Admin"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
