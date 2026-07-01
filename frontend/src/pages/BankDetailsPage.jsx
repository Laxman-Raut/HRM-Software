import React, { useState, useEffect } from "react";
import { Landmark, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import EmployeeBankDetailsView from "../components/BankDetails/EmployeeBankDetailsView";
import AdminBankDetailsView from "../components/BankDetails/AdminBankDetailsView";
import "./BankDetailsPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/bank-details`;

export default function BankDetailsPage({ user, employees }) {
  const isAdminOrHr = user && user.role !== "Employee";

  // Data states
  const [bankDetails, setBankDetails] = useState(null); // for Employee
  const [bankDetailsList, setBankDetailsList] = useState([]); // for Admin/HR
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState(null); // tracks verify/reject loading for specific ID
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (isAdminOrHr) {
        // Fetch all bank details
        const response = await fetch(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setBankDetailsList(data.data || []);
        } else {
          showToast(data.message || "Failed to load bank records.", "error");
        }
      } else {
        // Fetch current employee's bank details
        const response = await fetch(`${API_BASE_URL}/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setBankDetails(data.data || null);
        } else if (response.status === 404) {
          setBankDetails(null); // No details added yet (normal case)
        } else {
          showToast(data.message || "Failed to load bank details.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, [user, isAdminOrHr]);

  // Handle Employee Save/Update
  const handleEmployeeSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = bankDetails ? `${API_BASE_URL}/my` : API_BASE_URL;
      const method = bankDetails ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setBankDetails(data.data);
        showToast(
          bankDetails
            ? "Bank details updated and submitted for review!"
            : "Bank details added and submitted for review!",
          "success"
        );
        fetchBankDetails();
      } else {
        throw new Error(data.message || "Failed to save bank details.");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Network error. Failed to save details.", "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle HR/Admin Verification
  const handleVerify = async (id) => {
    setIsUpdatingId(id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/verify/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Bank details successfully verified!", "success");
        fetchBankDetails();
      } else {
        showToast(data.message || "Failed to verify bank details.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to verify details.", "error");
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Handle HR/Admin Rejection
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this employee's bank details?")) return;
    
    setIsUpdatingId(id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reject/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Bank details marked as rejected.", "success");
        fetchBankDetails();
      } else {
        showToast(data.message || "Failed to reject bank details.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to reject details.", "error");
    } finally {
      setIsUpdatingId(null);
    }
  };

  return (
    <div className="bank-details-container fade-in">
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
            gap: "0.5rem",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="dashboard-header-panel" style={{ marginBottom: "1.5rem" }}>
        <div className="header-welcome-text">
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Landmark size={28} style={{ color: "var(--primary)" }} />
            {isAdminOrHr ? "Bank Details Verification" : "My Bank Account"}
          </h1>
          <p style={{ marginTop: "0.25rem", color: "var(--text-secondary)" }}>
            {isAdminOrHr
              ? "Oversee and verify bank accounts for salary payouts."
              : "Manage your bank account details for payroll processing."}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem", gap: "1rem" }}>
          <Loader2 className="spinner" size={32} style={{ color: "var(--primary)" }} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading account records...</span>
        </div>
      ) : isAdminOrHr ? (
        <AdminBankDetailsView
          bankDetailsList={bankDetailsList}
          onVerify={handleVerify}
          onReject={handleReject}
          isUpdatingId={isUpdatingId}
        />
      ) : (
        <EmployeeBankDetailsView
          bankDetails={bankDetails}
          onSubmit={handleEmployeeSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
