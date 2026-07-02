import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import EmployeeDirectoryPage from "./pages/EmployeeDirectoryPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import AttendancePage from "./pages/AttendancePage";
import WarningPage from "./pages/WarningPage";
import LeavePage from "./pages/LeavePage";
import HolidayPage from "./pages/HolidayPage";
import AnnouncementPage from "./pages/AnnouncementPage";
import ResignationPage from "./pages/ResignationPage";
import DocumentPage from "./pages/DocumentPage";
import PayrollPage from "./pages/PayrollPage";
import BankDetailsPage from "./pages/BankDetailsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import EmployeeFormModal from "./components/Employee/EmployeeFormModal";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Toast from "./components/Common/Toast";
import { Loader2, ServerCrash } from "lucide-react";
import { getEmployeeDbId } from "./utils/idResolver";

import { API_BASE_URL, BASE_URL } from "./config";
export default function App() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals & Details state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formEmployee, setFormEmployee] = useState(null); // null = Add, object = Edit
  
  // Toasts state
  const [toasts, setToasts] = useState([]);

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("blue");

  // RBAC permissions state
  const [permissions, setPermissions] = useState({});
  const [systemRoles, setSystemRoles] = useState(["Admin", "HR", "Manager", "Employee"]);
  const [userPhoto, setUserPhoto] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.profilePhoto || "";
    } catch {
      return "";
    }
  });

  const applyThemeColor = (color) => {
    const colors = {
      blue: {
        primary: "#2563eb",
        hover: "#1d4ed8",
        gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
        light: "rgba(37, 99, 235, 0.1)",
        glow: "rgba(37, 99, 235, 0.08)"
      },
      emerald: {
        primary: "#10b981",
        hover: "#059669",
        gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
        light: "rgba(16, 185, 129, 0.1)",
        glow: "rgba(16, 185, 129, 0.08)"
      },
      violet: {
        primary: "#8b5cf6",
        hover: "#7c3aed",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
        light: "rgba(139, 92, 246, 0.1)",
        glow: "rgba(139, 92, 246, 0.08)"
      },
      amber: {
        primary: "#f59e0b",
        hover: "#d97706",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        light: "rgba(245, 158, 11, 0.1)",
        glow: "rgba(245, 158, 11, 0.08)"
      },
      zinc: {
        primary: "#71717a",
        hover: "#52525b",
        gradient: "linear-gradient(135deg, #71717a 0%, #a1a1aa 100%)",
        light: "rgba(113, 113, 122, 0.1)",
        glow: "rgba(113, 113, 122, 0.08)"
      }
    };

    const active = colors[color] || colors.blue;
    document.documentElement.style.setProperty("--primary", active.primary);
    document.documentElement.style.setProperty("--primary-hover", active.hover);
    document.documentElement.style.setProperty("--primary-gradient", active.gradient);
    document.documentElement.style.setProperty("--primary-light", active.light);
    document.documentElement.style.setProperty("--primary-glow", active.glow);
  };

  const loadSystemSettings = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/settings/my-permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { themeMode, themeColor: col, permissions: perms, roles } = json.data;

          const userThemePreference = localStorage.getItem("themePreference");
          if (userThemePreference) {
            setDarkMode(userThemePreference === "dark");
          } else {
            setDarkMode(themeMode === "dark");
          }

          setThemeColor(col || "blue");
          applyThemeColor(col || "blue");

          if (perms) {
            setPermissions(perms);
          }
          if (roles && roles.length > 0) {
            setSystemRoles(roles);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load global theme settings:", err);
    }
  };

  const loadProfilePhoto = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const photo = json.data.profilePhoto || json.data.employee?.profilePhoto;
          if (photo) {
            setUserPhoto(photo);
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser && currentUser.profilePhoto !== photo) {
              currentUser.profilePhoto = photo;
              localStorage.setItem("user", JSON.stringify(currentUser));
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load user profile photo:", err);
    }
  };

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch (e) {
      return null;
    }
  });

  // Toast helper
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Fetch all employees (Admin/HR only — Employees are redirected to their own dashboard)
  const fetchEmployees = async () => {
    if (!isAuthenticated) return;

    // Employee role users cannot access the employees list endpoint (403)
    // They have their own dashboard that fetches their personal data directly
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    })();
    if (currentUser && currentUser.role === "Employee") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      // 401 = invalid/expired token → logout
      // 403 = forbidden (role mismatch) → don't logout, just show error
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const resData = await response.json();
      if (resData.success) {
        setEmployees(resData.data || []);
      } else {
        throw new Error(resData.message || "Failed to fetch employees");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not connect to the database server.");
      addToast("Failed to sync employee data with database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    loadSystemSettings();
    loadProfilePhoto();
  }, [isAuthenticated]);

  useEffect(() => {
    window.reloadSystemSettings = loadSystemSettings;
    window.reloadProfilePhoto = loadProfilePhoto;
    return () => {
      delete window.reloadSystemSettings;
      delete window.reloadProfilePhoto;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }, [darkMode]);

  // Log out authenticated user session if they access forgot/reset password pages
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/reset-password") || path === "/forgot-password") {
      if (localStorage.getItem("token") || isAuthenticated) {
        handleLogout();
      }
    }
  }, [navigate, isAuthenticated]);

  // Create employee
  const handleCreateEmployee = async (employeeData) => {
    const formData = new FormData();
    Object.keys(employeeData).forEach((key) => {
      if (key === "profilePhotoFile") {
        if (employeeData[key]) {
          formData.append("profilePhoto", employeeData[key]);
        }
      } else if (key !== "profilePhoto") {
        formData.append(key, employeeData[key]);
      }
    });

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: formData,
    });

    const resData = await response.json();
    if (!response.ok || !resData.success) {
      throw new Error(resData.message || "Failed to create employee");
    }

    addToast("Employee created successfully!", "success");
    fetchEmployees();
  };

  // Update employee
  const handleUpdateEmployee = async (employeeData) => {
    const id = getEmployeeDbId(employeeData);
    // Strip Mongoose metadata, password, and immutable fields to prevent db validation errors
    const { _id, id: resolvedId, createdAt, updatedAt, __v, password, ...updateBody } = employeeData;
    
    const formData = new FormData();
    Object.keys(updateBody).forEach((key) => {
      if (key === "profilePhotoFile") {
        if (updateBody[key]) {
          formData.append("profilePhoto", updateBody[key]);
        }
      } else if (key !== "profilePhoto") {
        formData.append(key, updateBody[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: formData,
    });

    const resData = await response.json();
    if (!response.ok || !resData.success) {
      throw new Error(resData.message || "Failed to update employee");
    }

    addToast("Employee updated successfully!", "success");
    fetchEmployees();
  };

  // Delete employee
  const handleDeleteEmployee = async (idOrObj) => {
    try {
      const id = typeof idOrObj === "string" ? idOrObj : getEmployeeDbId(idOrObj);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to delete employee");
      }

      addToast("Employee record deleted successfully", "success");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to delete employee record", "error");
    }
  };

  const showAddModal = () => {
    setFormEmployee(null);
    navigate("/employees");
    setFormModalOpen(true);
  };

  const showEditModal = (employee) => {
    setFormEmployee(employee);
    setFormModalOpen(true);
  };

  const handleThemeToggle = (newVal) => {
    setDarkMode(newVal);
    localStorage.setItem("themePreference", newVal ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setEmployees([]);
  };

  return (
    <div className="app-container">
      {isAuthenticated && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          permissions={permissions}
        />
      )}

      {/* Mobile Drawer Backdrop */}
      {isAuthenticated && mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content scaffold */}
      <main className={`main-content ${!isAuthenticated ? "full-width-login" : collapsed ? "collapsed" : ""}`}>
        {isAuthenticated && (
          <Navbar
            darkMode={darkMode}
            setDarkMode={handleThemeToggle}
            onLogout={handleLogout}
            setMobileOpen={setMobileOpen}
            user={user}
            userPhoto={userPhoto}
          />
        )}

        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={(u) => { setIsAuthenticated(true); setUser(u); }} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : loading && employees.length === 0 ? (
          <div className="loading-screen">
            <Loader2 className="spinner" size={40} />
            <span>Syncing database records...</span>
          </div>
        ) : error && employees.length === 0 ? (
          <div className="loading-screen" style={{ gap: "1.5rem" }}>
            <ServerCrash size={56} style={{ color: "var(--danger)" }} />
            <div style={{ textAlign: "center" }}>
              <h3 className="empty-state-title" style={{ marginBottom: "0.5rem" }}>
                Backend Server Connection Failed
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "420px" }}>
                We couldn't connect to `{BASE_URL}`. Ensure that the backend is running and the database link is configured correctly.
              </p>
            </div>
            <button className="btn btn-primary" onClick={fetchEmployees}>
              Retry Connection
            </button>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                user && user.role === "Employee" ? (
                  <EmployeeDashboardPage
                    employees={employees}
                    user={user}
                  />
                ) : (
                  <DashboardPage
                    employees={employees}
                    showAddModal={showAddModal}
                    user={user}
                  />
                )
              }
            />
            <Route
              path="/employees"
              element={
                <EmployeeDirectoryPage
                  employees={employees}
                  onEdit={showEditModal}
                  onDelete={handleDeleteEmployee}
                  showAddModal={showAddModal}
                  user={user}
                />
              }
            />
            <Route
              path="/employees/:id"
              element={
                <EmployeeDetailPage
                  employees={employees}
                  onEdit={showEditModal}
                  onDelete={handleDeleteEmployee}
                  user={user}
                />
              }
            />
            <Route
              path="/attendance"
              element={
                <AttendancePage
                  user={user}
                  employees={employees}
                />
              }
            />
            <Route
              path="/warnings"
              element={
                <WarningPage
                  user={user}
                  employees={employees}
                />
              }
            />
            <Route
              path="/leaves"
              element={
                <LeavePage
                  user={user}
                  employees={employees}
                />
              }
            />
            <Route
              path="/holidays"
              element={
                <HolidayPage
                  user={user}
                />
              }
            />
            <Route
              path="/announcements"
              element={
                <AnnouncementPage
                  user={user}
                />
              }
            />
            <Route
              path="/resignations"
              element={
                <ResignationPage
                  user={user}
                />
              }
            />
            <Route
              path="/documents"
              element={
                <DocumentPage
                  user={user}
                />
              }
            />
            <Route
              path="/payroll"
              element={
                <PayrollPage
                  user={user}
                  employees={employees}
                />
              }
            />
            <Route
              path="/bank-details"
              element={
                <BankDetailsPage
                  user={user}
                  employees={employees}
                />
              }
            />
            <Route
              path="/settings"
              element={
                user && (user.role === "Admin" || permissions.canManageSettings) ? (
                  <SettingsPage user={user} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage user={user} />
              }
            />
          </Routes>
        )}
      </main>

      {/* Modals & Portal */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={formEmployee ? handleUpdateEmployee : handleCreateEmployee}
        employee={formEmployee}
        systemRoles={systemRoles}
      />

      <Toast toasts={toasts} setToasts={setToasts} />
    </div>
  );
}
