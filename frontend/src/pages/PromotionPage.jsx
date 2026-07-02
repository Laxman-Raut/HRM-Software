import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  User,
  Calendar,
  DollarSign,
  Building,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import "./PromotionPage.css";
import { BASE_URL } from "../config";

const API_PROMOTIONS_URL = `${BASE_URL}/api/promotions`;
const API_EMPLOYEES_URL = `${BASE_URL}/api/employees`;

export default function PromotionPage({ user }) {
  const [promotions, setPromotions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    promotionTitle: "",
    newDesignation: "",
    newDepartment: "",
    newSalary: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "",
    remarks: ""
  });

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_PROMOTIONS_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPromotions(data.data || []);
      } else {
        showToast(data.message || "Failed to load promotions", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Could not retrieve promotions.", "error");
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_EMPLOYEES_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployees(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPromotions(), fetchEmployees()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected employee changes, update selectedEmployee state to show previous info
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find(e => e._id === selectedEmployeeId);
      setSelectedEmployee(emp || null);
      if (emp) {
        // Pre-populate new values with current values as starting point
        setFormData(prev => ({
          ...prev,
          newDesignation: emp.designation || "",
          newDepartment: emp.department || "",
          newSalary: emp.salary || ""
        }));
      }
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      showToast("Please select an employee to promote", "error");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_PROMOTIONS_URL}/${selectedEmployeeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Employee promoted successfully!", "success");
        setModalOpen(false);
        // Reset states
        setSelectedEmployeeId("");
        setFormData({
          promotionTitle: "",
          newDesignation: "",
          newDepartment: "",
          newSalary: "",
          effectiveDate: new Date().toISOString().split("T")[0],
          reason: "",
          remarks: ""
        });
        // Reload settings & employees list to sync with header
        if (window.reloadSystemSettings) window.reloadSystemSettings();
        loadData();
      } else {
        showToast(data.message || "Failed to create promotion", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to save promotion.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion record? This will not revert the employee's current designation or department automatically.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_PROMOTIONS_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Promotion record deleted.", "success");
        fetchPromotions();
      } else {
        showToast(data.message || "Failed to delete promotion record", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to delete record.", "error");
    }
  };

  if (loading) {
    return (
      <div className="promotions-loading-container fade-in">
        <Loader2 size={40} className="spinner" />
        <span>Loading promotion manager records...</span>
      </div>
    );
  }

  return (
    <div className="promotions-page-container fade-in">
      {/* Toast Alert */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <FileText size={18} />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header section */}
      <header className="promotions-page-header">
        <div className="header-info">
          <div className="header-icon-wrapper">
            <TrendingUp size={22} className="header-icon" />
          </div>
          <div>
            <h1>Promotions Manager</h1>
            <p className="subtitle">Track and issue designation, department, and salary upgrades.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Promote Employee</span>
        </button>
      </header>

      {/* Promotion Logs / Lists */}
      <div className="promotions-content-area glass-card">
        <div className="card-header">
          <Clock size={16} style={{ color: "var(--primary)" }} />
          <h2>Promotion Timeline Logs</h2>
        </div>

        {promotions.length === 0 ? (
          <div className="empty-logs-box">
            <AlertCircle size={32} />
            <p>No promotion events recorded in the system yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="promotions-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Promotion Title</th>
                  <th>Designation Change</th>
                  <th>Department Change</th>
                  <th>Salary Change (INR)</th>
                  <th>Effective Date</th>
                  <th>Promoted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => {
                  const emp = promo.employee || {};
                  return (
                    <tr key={promo._id} className="promo-row">
                      <td>
                        <div className="employee-info-cell">
                          <span className="emp-name">{emp.firstName ? `${emp.firstName} ${emp.lastName}` : "Deleted Employee"}</span>
                          <span className="emp-id">ID: {emp.employeeId || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="promo-title-cell">
                          <span className="title-text">{promo.promotionTitle}</span>
                          {promo.reason && <span className="reason-text" title={promo.reason}>Reason: {promo.reason}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="change-cell">
                          <span className="old-val">{promo.previousDesignation}</span>
                          <ArrowRight size={12} className="arrow-icon" />
                          <span className="new-val">{promo.newDesignation}</span>
                        </div>
                      </td>
                      <td>
                        <div className="change-cell">
                          <span className="old-val">{promo.previousDepartment}</span>
                          <ArrowRight size={12} className="arrow-icon" />
                          <span className="new-val">{promo.newDepartment}</span>
                        </div>
                      </td>
                      <td>
                        <div className="change-cell">
                          <span className="old-val">₹{(promo.previousSalary || 0).toLocaleString("en-IN")}</span>
                          <ArrowRight size={12} className="arrow-icon" />
                          <span className="new-val highlight">₹{promo.newSalary.toLocaleString("en-IN")}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-badge">
                          {new Date(promo.effectiveDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </td>
                      <td>
                        <div className="promoter-cell">
                          <span className="promoter-name">{promo.promotedByName || "System"}</span>
                          <span className="promoter-role">{promo.promotedByRole || "Admin"}</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn-icon-danger" onClick={() => handleDelete(promo._id)} title="Delete record">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promotion Action Modal */}
      {modalOpen && (
        <div className="promotion-modal-overlay">
          <div className="promotion-modal glass-card animate-zoom">
            <header className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.50rem" }}>
                <TrendingUp size={18} style={{ color: "var(--primary)" }} />
                <h3>Create Promotion Event</h3>
              </div>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handlePromote} className="modal-form-content">
              {/* Select Employee */}
              <div className="form-group-full">
                <label className="form-label">Select Employee *</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>
                      {e.firstName} {e.lastName} ({e.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Previous / Current Info Card if selected */}
              {selectedEmployee && (
                <div className="employee-info-preview-card">
                  <div className="preview-header">Current Job Metrics:</div>
                  <div className="preview-grid">
                    <div>
                      <span className="label">Designation:</span>
                      <span className="value">{selectedEmployee.designation || "N/A"}</span>
                    </div>
                    <div>
                      <span className="label">Department:</span>
                      <span className="value">{selectedEmployee.department || "N/A"}</span>
                    </div>
                    <div>
                      <span className="label">Salary (INR):</span>
                      <span className="value">₹{(selectedEmployee.salary || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Promotion Title */}
              <div className="form-group-full">
                <label className="form-label">Promotion Event Title *</label>
                <input
                  type="text"
                  name="promotionTitle"
                  value={formData.promotionTitle}
                  onChange={handleChange}
                  placeholder="e.g. Mid-Year Performance Promotion"
                  className="form-control"
                  required
                />
              </div>

              {/* New Designation & New Department */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">New Designation *</label>
                  <input
                    type="text"
                    name="newDesignation"
                    value={formData.newDesignation}
                    onChange={handleChange}
                    placeholder="e.g. Tech Lead"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Department *</label>
                  <select
                    name="newDepartment"
                    value={formData.newDepartment}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              {/* New Salary & Effective Date */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">New Salary (INR / Year) *</label>
                  <input
                    type="number"
                    name="newSalary"
                    value={formData.newSalary}
                    onChange={handleChange}
                    placeholder="e.g. 1200000"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Effective Date *</label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              {/* Reason & Remarks */}
              <div className="form-group-full">
                <label className="form-label">Reason for Promotion</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g. Consistently exceeded sales targets"
                  className="form-control"
                />
              </div>

              <div className="form-group-full">
                <label className="form-label">Additional Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Private remarks or notes..."
                  className="form-control textarea"
                />
              </div>

              {/* Action buttons */}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spinner" /> : <TrendingUp size={16} />}
                  <span>{submitting ? "Processing..." : "Promote Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
