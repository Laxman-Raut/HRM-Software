import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Save,
  Building,
  Mail,
  Coins,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Calendar,
  Layers,
  Globe,
  Hash,
  Plus,
  Trash2
} from "lucide-react";
import "./SettingsPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/settings`;

export default function SettingsPage({ user }) {
  // Guard access to Admin role (or user with settings permission)
  const isAdmin = user && (user.role === "Admin" || user.role === "HR");

  const [settings, setSettings] = useState({
    companyName: "",
    supportEmail: "",
    currency: "USD",
    allowEmployeeRegistration: false,
    roleSettings: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("general"); // "general" | "roles"
  const [newRoleName, setNewRoleName] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      showToast("Please enter a role name", "error");
      return;
    }
    const name = newRoleName.trim();
    if (settings.roleSettings.some(r => r.role.toLowerCase() === name.toLowerCase())) {
      showToast("This role already exists", "error");
      return;
    }

    const newRoleObj = {
      role: name,
      maxLeavesPerYear: 15,
      canApproveLeaves: false,
      canManageAttendance: false,
      canManagePayroll: false,
      canCreateAnnouncements: false,
      canIssueWarnings: false,
      workFromHomeAllowed: false,
      canManageEmployees: false,
      canViewEmployees: false,
      canManageHolidays: false,
      canManageSettings: false,
      canManageResignations: false,
      canViewDocuments: false,
    };

    setSettings(prev => ({
      ...prev,
      roleSettings: [...prev.roleSettings, newRoleObj]
    }));
    setNewRoleName("");
    showToast(`Role "${name}" added to layout. Click "Save Settings" to persist.`, "success");
  };

  const handleDeleteRole = (roleName) => {
    const protectedRoles = ["Admin", "HR", "Manager", "Employee"];
    if (protectedRoles.includes(roleName)) {
      showToast("Cannot delete a default system role", "error");
      return;
    }

    setSettings(prev => ({
      ...prev,
      roleSettings: prev.roleSettings.filter(r => r.role !== roleName)
    }));
    showToast(`Role "${roleName}" removed. Click "Save Settings" to persist.`, "success");
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAdmin) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_BASE_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          setSettings(resData.data || {
            companyName: "HRM Portal",
            supportEmail: "support@company.com",
            currency: "USD",
            allowEmployeeRegistration: false,
            roleSettings: []
          });
        } else {
          showToast(resData.message || "Failed to load settings", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Network error. Could not connect to backend settings API.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, isAdmin]);

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleRoleConfigChange = (roleName, field, value) => {
    setSettings((prev) => {
      const updatedRoleSettings = prev.roleSettings.map((roleConf) => {
        if (roleConf.role === roleName) {
          return { ...roleConf, [field]: value };
        }
        return roleConf;
      });
      return { ...prev, roleSettings: updatedRoleSettings };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Unauthorized request", "error");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setSettings(resData.data);
        showToast("System settings updated successfully", "success");
        if (typeof window.reloadSystemSettings === "function") {
          window.reloadSystemSettings();
        }
      } else {
        showToast(resData.message || "Failed to update settings", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Could not update settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="settings-error-container fade-in">
        <div className="error-card">
          <Lock size={48} className="lock-icon" />
          <h2>Access Denied</h2>
          <p>
            Only administrators are authorized to access the system configuration. 
            Please contact your platform admin for any permission queries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page-container fade-in">
      {/* Toast Alert */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="settings-page-header">
        <div className="header-info">
          <div className="header-icon-wrapper">
            <Settings size={22} className="header-icon" />
          </div>
          <div>
            <h1>System Settings</h1>
            <p className="subtitle">Configure corporate rules, metadata, and role permissions.</p>
          </div>
        </div>
        <button 
          className="btn btn-save" 
          onClick={handleSave} 
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="spinner" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </header>

      {/* Settings Navigation Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <Building size={16} />
          <span>General Settings</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "roles" ? "active" : ""}`}
          onClick={() => setActiveTab("roles")}
        >
          <Shield size={16} />
          <span>Role Permissions & Rules</span>
        </button>
      </div>

      {loading ? (
        <div className="settings-loading-card">
          <Loader2 size={36} className="spinner loading-spinner" />
          <span>Retrieving system configurations...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="settings-form-layout">
          {/* General Tab */}
          {activeTab === "general" && (
            <>
              <div className="settings-card card-general animate-fade">
              <div className="card-header">
                <Building size={20} className="section-icon" />
                <div>
                  <h3>Company Profile</h3>
                  <p>Basic organization settings and login behavior.</p>
                </div>
              </div>

              <div className="card-body">
                <div className="input-grid">
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <div className="input-wrapper">
                      <Building size={16} className="input-icon" />
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={settings.companyName}
                        onChange={handleGeneralChange}
                        placeholder="e.g., Acme Corporation"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="supportEmail">Support Email</label>
                    <div className="input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        id="supportEmail"
                        name="supportEmail"
                        value={settings.supportEmail}
                        onChange={handleGeneralChange}
                        placeholder="e.g., support@acme.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="currency">System Currency</label>
                    <div className="input-wrapper">
                      <Coins size={16} className="input-icon" />
                      <select
                        id="currency"
                        name="currency"
                        value={settings.currency}
                        onChange={handleGeneralChange}
                      >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                        <option value="AUD">AUD ($) - Australian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-toggle-group">
                  <div className="toggle-info">
                    <label>Self-Registration</label>
                    <p>Allow new employees to sign up through the login screen.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="allowEmployeeRegistration"
                      checked={settings.allowEmployeeRegistration}
                      onChange={handleGeneralChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-card card-theme" style={{ marginTop: "2rem" }}>
              <div className="card-header">
                <Settings size={20} className="section-icon" />
                <div>
                  <h3>Theme & Appearance</h3>
                  <p>Customize the default system theme mode and brand accent color.</p>
                </div>
              </div>

              <div className="card-body">
                <div className="form-group" style={{ maxWidth: "340px", marginBottom: "2rem" }}>
                  <label htmlFor="themeMode">Default Theme Mode</label>
                  <div className="input-wrapper">
                    <Settings size={16} className="input-icon" />
                    <select
                      id="themeMode"
                      name="themeMode"
                      value={settings.themeMode || "dark"}
                      onChange={handleGeneralChange}
                    >
                      <option value="dark">Dark Theme (Zinc Dark)</option>
                      <option value="light">Light Theme (Slate Light)</option>
                    </select>
                  </div>
                </div>

                <div className="color-palette-group">
                  <label className="palette-label">Brand Accent Color</label>
                  <p className="palette-desc">Choose a brand color to apply across buttons, tabs, links, and gradients.</p>
                  
                  <div className="color-options-grid">
                    {[
                      { id: "zinc", name: "Zinc Gray", color: "#71717a" },
                      { id: "blue", name: "Tech Blue", color: "#2563eb" },
                      { id: "emerald", name: "Emerald Mint", color: "#10b981" },
                      { id: "amber", name: "Sunset Amber", color: "#f59e0b" },
                      { id: "violet", name: "Royal Violet", color: "#8b5cf6" }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`color-preset-btn ${settings.themeColor === preset.id ? "active" : ""}`}
                        onClick={() => {
                          setSettings(prev => ({ ...prev, themeColor: preset.id }));
                        }}
                        title={preset.name}
                      >
                        <span 
                          className="color-preview-circle" 
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="preset-name">{preset.name}</span>
                        {settings.themeColor === preset.id && (
                          <span className="preset-checkmark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SMTP Settings Card */}
            <div className="settings-card card-smtp" style={{ marginTop: "2rem" }}>
              <div className="card-header">
                <Mail size={20} className="section-icon" />
                <div>
                  <h3>SMTP Configuration</h3>
                  <p>Configure the mail server settings for sending corporate emails.</p>
                </div>
              </div>

              <div className="card-body">
                <div className="input-grid">
                  <div className="form-group">
                    <label htmlFor="smtpHost">SMTP Host</label>
                    <div className="input-wrapper">
                      <Globe size={16} className="input-icon" />
                      <input
                        type="text"
                        id="smtpHost"
                        name="smtpHost"
                        value={settings.smtpHost || ""}
                        onChange={handleGeneralChange}
                        placeholder="e.g., smtp.gmail.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpPort">SMTP Port</label>
                    <div className="input-wrapper">
                      <Hash size={16} className="input-icon" />
                      <input
                        type="number"
                        id="smtpPort"
                        name="smtpPort"
                        value={settings.smtpPort || 587}
                        onChange={handleGeneralChange}
                        placeholder="e.g., 587"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpUser">SMTP User (Email)</label>
                    <div className="input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        id="smtpUser"
                        name="smtpUser"
                        value={settings.smtpUser || ""}
                        onChange={handleGeneralChange}
                        placeholder="e.g., admin@yourcompany.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="smtpPass">SMTP Password / App Password</label>
                    <div className="input-wrapper">
                      <Lock size={16} className="input-icon" />
                      <input
                        type="password"
                        id="smtpPass"
                        name="smtpPass"
                        value={settings.smtpPass || ""}
                        onChange={handleGeneralChange}
                        placeholder="••••••••••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

          {/* Role Settings Tab */}
          {activeTab === "roles" && (
            <div className="settings-card card-roles animate-fade">
              <div className="card-header">
                <Shield size={20} className="section-icon" />
                <div>
                  <h3>Role-Based Model Config</h3>
                  <p>Manage leave ceilings and specify feature access privileges for each user role.</p>
                </div>
              </div>

              <div className="card-body">
                {/* Dynamic Role Creator */}
                <div className="dynamic-role-creator" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: "1", minWidth: "200px" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Create Custom Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Intern, Team Lead, Finance Officer"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="btn btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem", minHeight: "auto", padding: "0.55rem 1rem", marginTop: "1.2rem" }}
                  >
                    <Plus size={16} />
                    <span>Add Role</span>
                  </button>
                </div>

                {settings.roleSettings && settings.roleSettings.length > 0 ? (
                  <div className="roles-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="roles-config-table">
                      <thead>
                        <tr>
                          <th>Role Name</th>
                          <th>Max Leaves/Yr</th>
                          <th>Approve Leaves</th>
                          <th>Manage Attendance</th>
                          <th>Manage Payroll</th>
                          <th>Create Announcements</th>
                          <th>Issue Warnings</th>
                          <th>Allow WFH</th>
                          <th>Manage Employees</th>
                          <th>View Employees</th>
                          <th>Manage Holidays</th>
                          <th>Manage Settings</th>
                          <th>Manage Resignations</th>
                          <th>View Documents</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.roleSettings.map((roleConf) => (
                          <tr key={roleConf.role} className="role-config-row">
                            <td className="role-name-cell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Layers size={14} className="role-icon" />
                                <span>{roleConf.role}</span>
                              </div>
                              {!["Admin", "HR", "Manager", "Employee"].includes(roleConf.role) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(roleConf.role)}
                                  style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", opacity: "0.7", padding: "0.25rem", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  title="Delete custom role"
                                  onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                                  onMouseOut={(e) => e.currentTarget.style.opacity = "0.7"}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                            <td>
                              <div className="table-input-wrapper">
                                <Calendar size={13} className="cell-input-icon" />
                                <input
                                  type="number"
                                  min="0"
                                  max="365"
                                  value={roleConf.maxLeavesPerYear}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "maxLeavesPerYear",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="table-number-input"
                                />
                              </div>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canApproveLeaves}
                                  disabled={roleConf.role === "Admin"} // Admin always true
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canApproveLeaves",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canManageAttendance}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canManageAttendance",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canManagePayroll}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canManagePayroll",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canCreateAnnouncements}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canCreateAnnouncements",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canIssueWarnings}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canIssueWarnings",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.workFromHomeAllowed}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "workFromHomeAllowed",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canManageEmployees || false}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canManageEmployees",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canViewEmployees || false}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canViewEmployees",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canManageHolidays || false}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canManageHolidays",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canManageSettings || false}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canManageSettings",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canManageResignations || false}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canManageResignations",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                            <td>
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={roleConf.canViewDocuments || false}
                                  disabled={roleConf.role === "Admin"}
                                  onChange={(e) =>
                                    handleRoleConfigChange(
                                      roleConf.role,
                                      "canViewDocuments",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-roles-state">
                    <Shield size={32} />
                    <p>No role configuration structure found. Please save settings to initialize default values.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
