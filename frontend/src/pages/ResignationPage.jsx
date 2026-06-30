import React, { useState, useEffect } from "react";
import {
  LogOut,
  Calendar,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Check,
  X,
  Search,
  Trash2,
} from "lucide-react";
import "./ResignationPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/resignations`;

export default function ResignationPage({ user }) {
  const isEmployee = user && user.role === "Employee";
  const isAdminOrHr = user && user.role !== "Employee";

  // Data states
  const [resignations, setResignations] = useState([]); // Admin/HR only
  const [myResignation, setMyResignation] = useState(null); // Employee only
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters (Admin/HR only)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Form states (Employee submit form)
  const [submitFormData, setSubmitFormData] = useState({
    reason: "",
    noticePeriod: 30,
    lastWorkingDay: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Review Modal state (Admin/HR only)
  const [reviewItem, setReviewItem] = useState(null);
  const [hrRemarks, setHrRemarks] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Revoke and Delete states
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchResignationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isEmployee) {
        // Fetch employee's own resignation
        const res = await fetch(`${API_BASE_URL}/my`, { headers });
        const data = await res.json();
        if (res.ok && data.success) {
          setMyResignation(data.data || null);
        } else {
          showToast(data.message || "Failed to load resignation details.", "error");
        }
      } else {
        // Fetch all resignations for Admin/HR
        const res = await fetch(API_BASE_URL, { headers });
        const data = await res.json();
        if (res.ok && data.success) {
          setResignations(data.data || []);
        } else {
          showToast(data.message || "Failed to load resignation list.", "error");
        }
      }
    } catch (err) {
      showToast("Network error. Could not retrieve resignation data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignationData();
  }, [user]);

  // Employee Form submission
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSubmitFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitResignation = async (e) => {
    e.preventDefault();
    if (!submitFormData.reason.trim() || !submitFormData.lastWorkingDay) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitFormData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Resignation request submitted successfully.", "success");
        fetchResignationData();
      } else {
        showToast(data.message || "Failed to submit resignation.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to submit request.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Admin/HR Action submission
  const handleUpdateStatus = async (status) => {
    if (!reviewItem) return;
    setReviewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${reviewItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          hrRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Request has been ${status.toLowerCase()} successfully.`, "success");
        setReviewItem(null);
        setHrRemarks("");
        fetchResignationData();
      } else {
        showToast(data.message || "Failed to update request.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to update status.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleRevokeResignation = async () => {
    if (!myResignation) return;
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${myResignation._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Resignation request revoked successfully.", "success");
        setRevokeConfirmOpen(false);
        fetchResignationData();
      } else {
        showToast(data.message || "Failed to revoke resignation.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to revoke request.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Resignation request deleted successfully.", "success");
        setDeleteConfirmId(null);
        fetchResignationData();
      } else {
        showToast(data.message || "Failed to delete request.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to delete request.", "error");
    }
  };

  // Filters (Admin/HR only)
  const filteredResignations = resignations.filter((req) => {
    const emp = req.employee || {};
    const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
    const empId = (emp.employeeId || "").toLowerCase();
    const dept = (emp.department || "").toLowerCase();

    const matchesSearch =
      empName.includes(searchQuery.toLowerCase()) ||
      empId.includes(searchQuery.toLowerCase()) ||
      dept.includes(searchQuery.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "All" || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="resignation-page container">
      {/* Toast alert */}
      {toast && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <LogOut className="title-icon text-primary" /> Resignations
        </h1>
        <p className="page-subtitle">
          {isEmployee
            ? "Submit or track your resignation request."
            : "Manage organization resignation submissions and employee offboarding."}
        </p>
      </header>

      {/* Main Content Layout */}
      {loading ? (
        <div className="loading-state flex flex-col items-center justify-center">
          <Loader2 className="spinner" size={40} />
          <p>Loading resignation data...</p>
        </div>
      ) : isEmployee ? (
        /* ==================== EMPLOYEE VIEW ==================== */
        <div className="employee-layout">
          {myResignation ? (
            /* Current resignation request details */
            <div className="details-card">
              <div className="card-header flex justify-between items-center">
                <h2 className="section-title flex items-center gap-2">
                  <FileText size={20} className="text-primary" /> Resignation Details
                </h2>
                <span className={`status-badge status-${myResignation.status.toLowerCase()}`}>
                  {myResignation.status}
                </span>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Submission Date</span>
                  <span className="value flex items-center gap-1">
                    <Calendar size={15} />
                    {new Date(myResignation.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">Notice Period</span>
                  <span className="value flex items-center gap-1">
                    <Clock size={15} />
                    {myResignation.noticePeriod} Days
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">Last Working Day</span>
                  <span className="value flex items-center gap-1">
                    <Calendar size={15} />
                    {new Date(myResignation.lastWorkingDay).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="detail-block">
                <span className="label">Reason for Leaving</span>
                <p className="value text-block">{myResignation.reason}</p>
              </div>

              {myResignation.status !== "Pending" && (
                <div className="hr-review-box">
                  <h3>HR / Administration Review</h3>
                  <div className="details-grid mt-2">
                    <div className="detail-item">
                      <span className="label">Reviewed By</span>
                      <span className="value flex items-center gap-1">
                        <User size={15} />
                        {myResignation.approvedBy || "Administrator"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Decision Date</span>
                      <span className="value flex items-center gap-1">
                        <Calendar size={15} />
                        {myResignation.approvedDate ? new Date(myResignation.approvedDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                  {myResignation.hrRemarks && (
                    <div className="detail-block mt-3">
                      <span className="label">HR Remarks</span>
                      <p className="value text-block remarks-text">{myResignation.hrRemarks}</p>
                    </div>
                  )}
                </div>
              )}
              {myResignation.status === "Pending" && (
                <div className="flex justify-start mt-4">
                  <button
                    type="button"
                    className="btn btn-danger flex items-center gap-1"
                    onClick={() => setRevokeConfirmOpen(true)}
                  >
                    Revoke Resignation
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Submission Form */
            <div className="submission-card">
              <h2 className="section-title">Submit Resignation</h2>
              <form onSubmit={handleSubmitResignation} className="resignation-form">
                <div className="form-group">
                  <label className="required-label">Reason for Leaving</label>
                  <textarea
                    name="reason"
                    rows={4}
                    required
                    value={submitFormData.reason}
                    onChange={handleFormChange}
                    placeholder="Please explain the reason for your resignation..."
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="required-label">Notice Period (Days)</label>
                    <input
                      type="number"
                      name="noticePeriod"
                      min={0}
                      required
                      value={submitFormData.noticePeriod}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="required-label">Preferred Last Working Day</label>
                    <input
                      type="date"
                      name="lastWorkingDay"
                      required
                      value={submitFormData.lastWorkingDay}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-actions mt-4">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn btn-primary flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="spinner" size={18} /> Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* ==================== ADMIN / HR VIEW ==================== */
        <div className="admin-layout flex flex-col gap-4">
          {/* Filters Bar */}
          <section className="filters-card">
            <div className="filters-grid">
              <div className="search-group">
                <label>Search Employee / Details</label>
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control padded-left"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="All">All Requests</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Resignations Table */}
          <div className="table-card">
            {filteredResignations.length === 0 ? (
              <div className="empty-state text-center">
                <LogOut size={50} className="empty-icon" />
                <h3>No resignation requests found</h3>
                <p>There are no resignation requests matching your criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Notice Period</th>
                      <th>Last Working Day</th>
                      <th>Submit Date</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResignations.map((req) => {
                      const emp = req.employee || {};
                      const dateStr = new Date(req.createdAt).toLocaleDateString();
                      const lwdStr = new Date(req.lastWorkingDay).toLocaleDateString();

                      return (
                        <tr key={req._id}>
                          <td>
                            <div className="employee-info-cell">
                              <span className="emp-name">{`${emp.firstName || "Employee"} ${emp.lastName || ""}`}</span>
                              <span className="emp-meta">{emp.employeeId || "N/A"} | {emp.designation || "Staff"}</span>
                            </div>
                          </td>
                          <td>{req.noticePeriod} Days</td>
                          <td>{lwdStr}</td>
                          <td>{dateStr}</td>
                          <td>
                            <span className={`status-badge status-${req.status.toLowerCase()}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              {req.status === "Pending" ? (
                                <button
                                  className="btn-table-action"
                                  onClick={() => {
                                    setReviewItem(req);
                                    setHrRemarks(req.hrRemarks || "");
                                  }}
                                >
                                  Review Request
                                </button>
                              ) : (
                                <span className="reviewed-by-txt" title={req.hrRemarks}>
                                  Reviewed
                                </span>
                              )}
                              <button
                                className="btn-table-action btn-danger flex items-center justify-center"
                                style={{ padding: "0.35rem 0.5rem" }}
                                onClick={() => setDeleteConfirmId(req._id)}
                                title="Delete Request"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Request Modal (Admin/HR Only) */}
      {reviewItem && (
        <div className="modal-backdrop">
          <div className="custom-modal resignation-review-modal">
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">Review Resignation Request</h3>
              <button className="close-btn" onClick={() => setReviewItem(null)}>
                &times;
              </button>
            </div>

            <div className="modal-form">
              <div className="modal-info-section">
                <div className="employee-details flex justify-between mb-3">
                  <div>
                    <span className="sub-label">Employee</span>
                    <span className="main-value">
                      {`${reviewItem.employee?.firstName || "Staff"} ${reviewItem.employee?.lastName || ""}`}
                    </span>
                  </div>
                  <div>
                    <span className="sub-label">ID / Department</span>
                    <span className="main-value">
                      {reviewItem.employee?.employeeId || "N/A"} | {reviewItem.employee?.department || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="details-grid-small border-top pt-2">
                  <div>
                    <span className="sub-label">Preferred Last Working Day</span>
                    <span className="main-value">{new Date(reviewItem.lastWorkingDay).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="sub-label">Notice Period</span>
                    <span className="main-value">{reviewItem.noticePeriod} Days</span>
                  </div>
                </div>

                <div className="reason-container border-top pt-2 mt-2">
                  <span className="sub-label font-bold">Reason for resignation:</span>
                  <p className="reason-text">{reviewItem.reason}</p>
                </div>
              </div>

              <div className="form-group mt-3">
                <label>HR Remarks / Offboarding Comments</label>
                <textarea
                  value={hrRemarks}
                  onChange={(e) => setHrRemarks(e.target.value)}
                  placeholder="Input decision comments or offboarding checklists..."
                  rows={3}
                  className="form-control"
                />
              </div>

              <div className="modal-actions flex justify-between items-center gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={reviewLoading}
                  onClick={() => setReviewItem(null)}
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-danger flex items-center gap-1"
                    disabled={reviewLoading}
                    onClick={() => handleUpdateStatus("Rejected")}
                  >
                    <X size={15} /> Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-success flex items-center gap-1"
                    disabled={reviewLoading}
                    onClick={() => handleUpdateStatus("Approved")}
                  >
                    <Check size={15} /> Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Revoke Confirmation Modal (Employee Only) */}
      {revokeConfirmOpen && (
        <div className="modal-backdrop">
          <div className="custom-modal confirm-delete-modal">
            <h3 className="modal-title">Revoke Resignation</h3>
            <p className="modal-body-text">
              Are you sure you want to revoke your resignation request? This will cancel the resignation and delete the request.
            </p>
            <div className="modal-actions flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setRevokeConfirmOpen(false)} disabled={submitLoading}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={submitLoading}
                onClick={handleRevokeResignation}
              >
                {submitLoading ? "Revoking..." : "Revoke Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin/HR Only) */}
      {deleteConfirmId && (
        <div className="modal-backdrop">
          <div className="custom-modal confirm-delete-modal">
            <h3 className="modal-title">Delete Resignation Request</h3>
            <p className="modal-body-text">
              Are you sure you want to delete this resignation request? This action cannot be undone.
            </p>
            <div className="modal-actions flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteRequest(deleteConfirmId)}
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
