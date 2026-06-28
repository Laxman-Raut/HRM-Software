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
import EmployeeFormModal from "./components/Employee/EmployeeFormModal";
import Toast from "./components/Common/Toast";
import { Loader2, ServerCrash } from "lucide-react";
import { getEmployeeDbId } from "./utils/idResolver";

const API_BASE_URL = "http://localhost:5000/api/employees";

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

  // Fetch all employees
  const fetchEmployees = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.status === 401 || response.status === 403) {
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }, [darkMode]);

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
            setDarkMode={setDarkMode}
            onLogout={handleLogout}
            setMobileOpen={setMobileOpen}
            user={user}
          />
        )}

        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={(u) => { setIsAuthenticated(true); setUser(u); }} />} />
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
                We couldn't connect to `http://localhost:5000`. Ensure that the backend is running and the database link is configured correctly.
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
          </Routes>
        )}
      </main>

      {/* Modals & Portal */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={formEmployee ? handleUpdateEmployee : handleCreateEmployee}
        employee={formEmployee}
      />

      <Toast toasts={toasts} setToasts={setToasts} />
    </div>
  );
}
