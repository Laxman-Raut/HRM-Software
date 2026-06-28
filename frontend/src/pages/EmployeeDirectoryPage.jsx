import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { getEmployeeDbId } from "../utils/idResolver";
import ConfirmationModal from "../components/Common/ConfirmationModal";
import DirectoryToolbar from "../components/Employee/DirectoryToolbar";
import EmployeeCardList from "../components/Employee/EmployeeCardList";
import EmployeeTable from "../components/Employee/EmployeeTable";

export default function EmployeeDirectoryPage({
  employees,
  onEdit,
  onDelete,
  showAddModal,
  user,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  // 1. Get unique departments for filter dropdown
  const departments = ["All", ...new Set(employees.map((e) => e.department).filter(Boolean))];

  // 2. Filter employees list
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (emp.firstName && emp.firstName.toLowerCase().includes(searchLower)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(searchLower)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchLower)) ||
      (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchLower));

    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    const matchesType = selectedType === "All" || emp.employmentType === selectedType;
    const matchesStatus = selectedStatus === "All" || emp.employmentStatus === selectedStatus;

    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    onDelete(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleView = (emp) => {
    const id = getEmployeeDbId(emp);
    navigate(`/employees/${id}`);
  };

  return (
    <div className="fade-in">
      {/* Directory Toolbar Sub-Component */}
      <DirectoryToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        departments={departments}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        user={user}
        showAddModal={showAddModal}
      />

      {/* Directory Content Panels */}
      <div className="directory-content">
        {filteredEmployees.length > 0 ? (
          viewMode === "list" ? (
            /* Card Grid List Layout Sub-Component */
            <EmployeeCardList
              employees={filteredEmployees}
              getEmployeeDbId={getEmployeeDbId}
              handleView={handleView}
              onEdit={onEdit}
              handleDeleteClick={handleDeleteClick}
              user={user}
            />
          ) : (
            /* Tabular Grid Table Layout Sub-Component */
            <EmployeeTable
              employees={filteredEmployees}
              getEmployeeDbId={getEmployeeDbId}
              handleView={handleView}
              onEdit={onEdit}
              handleDeleteClick={handleDeleteClick}
              user={user}
              formatDate={formatDate}
            />
          )
        ) : (
          <div className="empty-state glass-card">
            <Briefcase size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Employees Found</h3>
            <p className="empty-state-desc" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              No matches found. Try relaxing search filters.
            </p>
          </div>
        )}
      </div>

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee Record"
        message="This will permanently delete this employee record from the system. This action is irreversible."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
