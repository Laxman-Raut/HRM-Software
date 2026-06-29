import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, CalendarRange, Plus } from "lucide-react";
import EmployeeLeaveView from "../components/Leave/EmployeeLeaveView";
import AdminLeaveView from "../components/Leave/AdminLeaveView";
import LeaveFormModal from "../components/Leave/LeaveFormModal";
import "./LeavePage.css";

const API_BASE_URL = "http://localhost:5000/api/leaves";

export default function LeavePage({ user, employees }) {
  const isAdminOrHr = user && user.role !== "Employee";

  // Data states
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchLeaves = async () => {
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
        setLeaves(data.data || []);
      } else {
        showToast(data.message || "Failed to load leave records", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to load leaves.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  // Handle applying for leave
  const handleApplyLeave = async (leaveData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(leaveData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Leave request submitted successfully!", "success");
        fetchLeaves();
      } else {
        throw new Error(data.message || "Failed to submit leave request");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Network error. Failed to apply for leave.", "error");
      throw err;
    }
  };

  // Handle approving or rejecting a leave request
  const handleApproveReject = async (id, status, remark) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, remark })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(`Leave request ${status.toLowerCase()} successfully!`, "success");
        fetchLeaves();
      } else {
        showToast(data.message || "Failed to update leave status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to update leave request.", "error");
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
    <div className="leave-container fade-in">
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
            Leave Management
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {isAdminOrHr 
              ? "Monitor and approve employee leave requests" 
              : "Apply for leaves and track your approval status"}
          </p>
        </div>

        {!isAdminOrHr && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Apply for Leave
          </button>
        )}
      </div>

      {/* Main Listing View */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: "200px" }}>
          <p>Loading leave records...</p>
        </div>
      ) : isAdminOrHr ? (
        <AdminLeaveView
          leaves={leaves}
          handleApproveReject={handleApproveReject}
          formatDate={formatDate}
        />
      ) : (
        <EmployeeLeaveView
          leaves={leaves}
          formatDate={formatDate}
        />
      )}

      {/* Leave Application Modal Form */}
      <LeaveFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleApplyLeave}
      />
    </div>
  );
}
