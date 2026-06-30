import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, AlertOctagon, Plus } from "lucide-react";
import AdminWarningView from "../components/Warning/AdminWarningView";
import EmployeeWarningView from "../components/Warning/EmployeeWarningView";
import WarningFormModal from "../components/Warning/WarningFormModal";
import "./WarningPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/warnings`;

export default function WarningPage({ user, employees }) {
  const isAdminOrHr = user && user.role !== "Employee";

  // Data states
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchWarnings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setWarnings(data.data || []);
      } else {
        showToast(data.message || "Failed to load warnings", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to load warnings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, [user]);

  // Handle issuing new warning
  const handleIssueWarning = async (warningData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(warningData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Warning issued successfully!", "success");
        fetchWarnings();
      } else {
        throw new Error(data.message || "Failed to issue warning");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Network error. Failed to issue warning.", "error");
      throw err;
    }
  };

  // Handle resolving a warning
  const handleResolveWarning = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Resolved" })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Warning marked as resolved!", "success");
        fetchWarnings();
      } else {
        showToast(data.message || "Failed to update warning status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to resolve warning.", "error");
    }
  };

  // Handle deleting/revoking a warning
  const handleDeleteWarning = async (id) => {
    if (!window.confirm("Are you sure you want to revoke and delete this warning? This action is irreversible.")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Warning record deleted successfully", "success");
        fetchWarnings();
      } else {
        showToast(data.message || "Failed to delete warning record", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to delete warning.", "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="warning-container fade-in">
      {/* Toast Alert Message */}
      {toast && (
        <div 
          className={`badge badge-${toast.type === "success" ? "active" : "inactive"}`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1200,
            padding: "1rem 1.5rem",
            fontSize: "0.9rem",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
        <div>
          <h1 className="page-title" style={{ fontFamily: "var(--font-heading)" }}>
            Policy Warnings
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {isAdminOrHr 
              ? "Issue and manage warnings for security or policy infractions" 
              : "Review policy citations and active status notifications"}
          </p>
        </div>

        {isAdminOrHr && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Issue Warning
          </button>
        )}
      </div>

      {/* Main Listing View */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: "200px" }}>
          <p>Loading warning records...</p>
        </div>
      ) : isAdminOrHr ? (
        <AdminWarningView
          warnings={warnings}
          handleResolve={handleResolveWarning}
          handleDeleteClick={handleDeleteWarning}
          formatDate={formatDate}
        />
      ) : (
        <EmployeeWarningView
          warnings={warnings}
          formatDate={formatDate}
        />
      )}

      {/* Warning Issue Modal Form */}
      <WarningFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleIssueWarning}
        employees={employees}
      />
    </div>
  );
}
