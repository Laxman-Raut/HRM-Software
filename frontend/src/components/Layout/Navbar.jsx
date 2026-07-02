import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Sun, 
  Moon, 
  User, 
  Bell, 
  LogOut, 
  Menu, 
  Check, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon 
} from "lucide-react";

import { BASE_URL } from "../../config";
const NOTIFICATIONS_API = `${BASE_URL}/api/notifications`;

export default function Navbar({ darkMode, setDarkMode, onLogout, setMobileOpen, user, userPhoto }) {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(NOTIFICATIONS_API, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setNotifications(json.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Poll notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle closing dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClose = () => setDropdownOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [dropdownOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Optimistically update locally first
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );

    try {
      await fetch(`${NOTIFICATIONS_API}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation(); // prevent dropdown closing
    const token = localStorage.getItem("token");
    if (!token) return;

    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    // Optimistically update locally
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await Promise.all(
        unread.map(n => 
          fetch(`${NOTIFICATIONS_API}/${n._id}`, {
            method: "PUT",
            headers
          })
        )
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      // rollback or refetch on error
      fetchNotifications();
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) {
      return user && user.role === "Employee" ? "My Dashboard" : "Dashboard Overview";
    }
    if (path.match(/\/employees\/[a-zA-Z0-9_-]+/)) {
      return "Employee Profile Details";
    }
    if (path.includes("/employees")) {
      return "Employee Directory";
    }
    if (path.includes("/holidays")) {
      return "Holiday Calendar";
    }
    return "HRM Portal";
  };

  // Helper to format date relatively
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Helper to get matching type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return CheckCircle2;
      case "WARNING":
        return AlertTriangle;
      case "ERROR":
        return AlertOctagon;
      case "INFO":
      default:
        return Info;
    }
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        {/* Notifications Icon & Dropdown Wrapper */}
        <div className="navbar-notification-wrapper" onClick={handleDropdownClick}>
          <button 
            className={`navbar-action-btn ${dropdownOpen ? "active" : ""}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {dropdownOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="notifications-clear-btn" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notifications-dropdown-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const Icon = getNotificationIcon(n.type);
                    const iconClass = n.type ? n.type.toLowerCase() : "info";
                    return (
                      <div 
                        key={n._id} 
                        className={`notification-dropdown-item ${n.isRead ? "" : "unread"}`}
                        onClick={() => handleMarkAsRead(n._id)}
                      >
                        <div className={`notification-item-icon-box ${iconClass}`}>
                          <Icon size={14} />
                        </div>
                        <div className="notification-item-content">
                          <span className="notification-item-title">{n.title}</span>
                          <span className="notification-item-message">{n.message}</span>
                          <span className="notification-item-time">{formatRelativeTime(n.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="notification-dropdown-empty">
                    <Bell className="notification-dropdown-empty-icon" size={24} />
                    <span className="notification-dropdown-empty-text">No notifications</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
          <div className="navbar-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {userPhoto ? (
              <img src={userPhoto} alt="Profile" className="navbar-avatar-img" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
            ) : (
              <User size={16} />
            )}
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
