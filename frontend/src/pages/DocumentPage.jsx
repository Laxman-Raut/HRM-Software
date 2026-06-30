import React, { useState, useEffect, useRef } from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  X,
  Check,
  Search,
  ExternalLink,
} from "lucide-react";
import "./DocumentPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/documents`;

const DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Resume",
  "Passport Photo",
  "Degree Certificate",
  "Experience Letter",
  "Offer Letter",
  "Relieving Letter",
  "Other",
];

export default function DocumentPage({ user }) {
  const isEmployee = user && user.role === "Employee";
  const isAdminOrHr = user && user.role !== "Employee";

  // Data states
  const [documents, setDocuments] = useState([]); // Admin/HR: All documents, Employee: Own documents
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters (Admin/HR only)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Upload state (Employee only)
  const [uploadingType, setUploadingType] = useState(null);
  const fileInputRefs = useRef({});

  // Review Modal state (Admin/HR only)
  const [reviewItem, setReviewItem] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const url = isEmployee ? `${API_BASE_URL}/my` : API_BASE_URL;
      const res = await fetch(url, { headers });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setDocuments(data.data || []);
      } else {
        showToast(data.message || "Failed to load documents.", "error");
      }
    } catch (err) {
      showToast("Network error. Could not retrieve documents.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Employee: Handle Document Upload
  const handleUploadFile = async (documentType, file) => {
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be under 10MB.", "error");
      return;
    }

    // Validate type
    const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      showToast("Only PDF, PNG, JPG, and JPEG files are allowed.", "error");
      return;
    }

    setUploadingType(documentType);
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("document", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`${documentType} uploaded successfully!`, "success");
        fetchDocuments();
      } else {
        showToast(data.message || "Upload failed.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to upload file.", "error");
    } finally {
      setUploadingType(null);
    }
  };

  // Delete/Revoke Document
  const handleDeleteDocument = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Document deleted successfully.", "success");
        setDeleteConfirmId(null);
        fetchDocuments();
      } else {
        showToast(data.message || "Failed to delete document.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to delete document.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Admin/HR: Verify/Reject Document
  const handleVerifyDocument = async (status) => {
    if (!reviewItem) return;
    setReviewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${reviewItem._id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remarks }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Document has been marked as ${status.toLowerCase()}.`, "success");
        setReviewItem(null);
        setRemarks("");
        fetchDocuments();
      } else {
        showToast(data.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to review document.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  // Employee: Match documents to types
  const getDocumentByType = (type) => {
    return documents.find((doc) => doc.documentType === type);
  };

  // Admin/HR: Filter logic
  const filteredDocuments = documents.filter((doc) => {
    const emp = doc.employee || {};
    const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
    const empId = (emp.employeeId || "").toLowerCase();
    const dept = (emp.department || "").toLowerCase();

    const matchesSearch =
      empName.includes(searchQuery.toLowerCase()) ||
      empId.includes(searchQuery.toLowerCase()) ||
      dept.includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "All" || doc.documentType === filterType;
    const matchesStatus = filterStatus === "All" || doc.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="document-page container">
      {/* Toast Alert */}
      {toast && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FolderOpen className="title-icon text-primary" /> Document Management
        </h1>
        <p className="page-subtitle">
          {isEmployee
            ? "Upload, verify, and store your required company documents."
            : "Review, approve, and track employee-submitted verification documents."}
        </p>
      </header>

      {/* Main Layout */}
      {loading ? (
        <div className="loading-state flex flex-col items-center justify-center">
          <Loader2 className="spinner" size={40} />
          <p>Loading documents...</p>
        </div>
      ) : isEmployee ? (
        /* ==================== EMPLOYEE VIEW ==================== */
        <div className="employee-layout flex flex-col gap-4">
          <div className="alert-box">
            <AlertCircle size={16} />
            <span>Allowed formats: PDF, PNG, JPG, JPEG. Max file size: 10MB. Uploaded documents will be reviewed by HR/Admin.</span>
          </div>

          <div className="documents-grid">
            {DOCUMENT_TYPES.map((type) => {
              const doc = getDocumentByType(type);
              const isUploading = uploadingType === type;

              return (
                <div key={type} className={`document-card ${doc ? `status-${doc.status.toLowerCase()}` : "empty"}`}>
                  <div className="card-top flex justify-between items-start">
                    <div className="type-info">
                      <FileText size={22} className="type-icon text-primary" />
                      <h3>{type}</h3>
                    </div>
                    {doc && (
                      <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                    )}
                  </div>

                  <div className="card-body">
                    {doc ? (
                      <div className="file-info">
                        <span className="file-name" title={doc.fileName}>{doc.fileName}</span>
                        <span className="upload-date">
                          Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        {doc.remarks && (
                          <div className="remarks-box mt-2">
                            <strong>HR Remarks:</strong> {doc.remarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-upload-zone">
                        <Upload size={24} className="upload-icon-muted" />
                        <p>No document uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="card-footer border-top pt-3 flex justify-between items-center gap-2">
                    {doc ? (
                      <>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action flex items-center gap-1"
                        >
                          <Eye size={14} /> View File
                        </a>
                        {doc.status !== "Verified" && (
                          <button
                            type="button"
                            className="btn-action btn-action-danger flex items-center gap-1"
                            onClick={() => setDeleteConfirmId(doc._id)}
                            title="Delete and Replace"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[type] = el)}
                          onChange={(e) => handleUploadFile(type, e.target.files[0])}
                          style={{ display: "none" }}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          className="btn btn-primary w-full flex items-center justify-center gap-2"
                          onClick={() => fileInputRefs.current[type].click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="spinner" size={16} /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={16} /> Upload File
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== ADMIN / HR VIEW ==================== */
        <div className="admin-layout flex flex-col gap-4">
          {/* Filters card */}
          <section className="filters-card">
            <div className="filters-grid">
              <div className="search-group">
                <label>Search Employee / Filename</label>
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control padded-left"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Document Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-control"
                >
                  <option value="All">All Types</option>
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </section>

          {/* Table Card */}
          <div className="table-card">
            {filteredDocuments.length === 0 ? (
              <div className="empty-state text-center">
                <FolderOpen size={50} className="empty-icon" />
                <h3>No documents found</h3>
                <p>There are no uploaded documents matching your criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Document Type</th>
                      <th>Filename</th>
                      <th>Upload Date</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => {
                      const emp = doc.employee || {};
                      const dateStr = new Date(doc.createdAt).toLocaleDateString();

                      return (
                        <tr key={doc._id}>
                          <td>
                            <div className="employee-info-cell">
                              <span className="emp-name">{`${emp.firstName || "Employee"} ${emp.lastName || ""}`}</span>
                              <span className="emp-meta">{emp.employeeId || "N/A"} | {emp.department || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <span className="doc-type-cell font-semibold">{doc.documentType}</span>
                          </td>
                          <td>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link-cell flex items-center gap-1 text-primary"
                              title="Click to view file"
                            >
                              {doc.fileName} <ExternalLink size={12} />
                            </a>
                          </td>
                          <td>{dateStr}</td>
                          <td>
                            <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                className="btn-table-action"
                                onClick={() => {
                                  setReviewItem(doc);
                                  setRemarks(doc.remarks || "");
                                }}
                              >
                                {doc.status === "Pending" ? "Verify / Approve" : "Update Status"}
                              </button>

                              <button
                                className="btn-table-action btn-danger flex items-center justify-center"
                                style={{ padding: "0.35rem 0.5rem" }}
                                onClick={() => setDeleteConfirmId(doc._id)}
                                title="Delete Document Log"
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

      {/* Review Modal (Admin/HR Only) */}
      {reviewItem && (
        <div className="modal-backdrop">
          <div className="custom-modal document-review-modal">
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">Verify Employee Document</h3>
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
                    <span className="sub-label">Document Type</span>
                    <span className="main-value font-bold">{reviewItem.documentType}</span>
                  </div>
                  <div>
                    <span className="sub-label">Upload Date</span>
                    <span className="main-value">{new Date(reviewItem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="file-view-container border-top pt-3 mt-2 flex items-center justify-between">
                  <div>
                    <span className="sub-label">Filename</span>
                    <span className="main-value text-muted" style={{ fontSize: "0.8rem" }}>{reviewItem.fileName}</span>
                  </div>
                  <a
                    href={reviewItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary flex items-center gap-1"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    <ExternalLink size={14} /> Open Document File
                  </a>
                </div>
              </div>

              <div className="form-group mt-3">
                <label>Review Remarks / Feedback</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Input reason for rejection or verification remarks..."
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
                    onClick={() => handleVerifyDocument("Rejected")}
                  >
                    <X size={15} /> Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-success flex items-center gap-1"
                    disabled={reviewLoading}
                    onClick={() => handleVerifyDocument("Verified")}
                  >
                    <Check size={15} /> Approve & Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Revoke Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop">
          <div className="custom-modal confirm-delete-modal">
            <h3 className="modal-title">Delete Document</h3>
            <p className="modal-body-text">
              Are you sure you want to delete this document? This will remove the file from storage.
            </p>
            <div className="modal-actions flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)} disabled={deleteLoading}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={deleteLoading}
                onClick={handleDeleteDocument}
              >
                {deleteLoading ? "Deleting..." : "Delete File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
