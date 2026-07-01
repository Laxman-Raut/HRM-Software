import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { getEmployeeDbId } from "../utils/idResolver";
import ConfirmationModal from "../components/Common/ConfirmationModal";
import EmployeeDetailCard from "../components/Employee/EmployeeDetailCard";
import EmployeeDetailTabs from "../components/Employee/EmployeeDetailTabs";

export default function EmployeeDetailPage({ employees, onEdit, onDelete, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Find employee matching route ID
  const employee = employees.find((emp) => getEmployeeDbId(emp) === id);

  if (!employee) {
    return (
      <div className="loading-screen fade-in">
        <p>Employee record not found.</p>
        <button className="btn btn-primary" onClick={() => navigate("/employees")}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleDeleteConfirm = () => {
    const dbId = getEmployeeDbId(employee);
    onDelete(dbId);
    setDeleteConfirmOpen(false);
    navigate("/employees");
  };

  return (
    <div className="fade-in">
      {/* Top Header Row */}
      <div className="header-bar">
        <button className="btn btn-secondary" onClick={() => navigate("/employees")} title="Back to employee directory">
          <ArrowLeft size={16} />
          Back to Directory
        </button>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {user && (user.role === "Admin" || user.role === "HR") && (
            <>
              <button className="btn btn-secondary" onClick={() => onEdit(employee)}>
                <Edit2 size={15} />
                Edit Profile
              </button>
              <button className="btn btn-danger" onClick={() => setDeleteConfirmOpen(true)}>
                <Trash2 size={15} />
                Delete Record
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Dual-pane Layout */}
      <div className="detail-layout-grid">
        {/* Left Pane Profile Card Sub-Component */}
        <EmployeeDetailCard employee={employee} />

        {/* Right Pane Tab Card Sub-Component */}
        <EmployeeDetailTabs
          employee={employee}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${employee.firstName} ${employee.lastName}`}
        message="This will permanently delete this employee record from the system. This action is irreversible."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
