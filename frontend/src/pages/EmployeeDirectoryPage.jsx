import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UserMinus,
  X,
  Grid,
  List,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";
import { getEmployeeDbId } from "../utils/idResolver";

function EmployeeAvatar({ emp }) {
  const [imgError, setImgError] = useState(false);
  const first = emp.firstName ? emp.firstName.charAt(0).toUpperCase() : "";
  const last = emp.lastName ? emp.lastName.charAt(0).toUpperCase() : "";
  const initials = first + last;

  if (emp.profilePhoto && emp.profilePhoto.trim() !== "" && !imgError) {
    return (
      <img
        src={emp.profilePhoto}
        alt={`${emp.firstName} ${emp.lastName}`}
        className="employee-avatar"
        onError={() => setImgError(true)}
      />
    );
  }
  return <div className="employee-avatar initials-avatar">{initials}</div>;
}

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
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, name, email or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Department Filter */}
          <select
            className="filter-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.filter(d => d !== "All").map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Intern">Intern</option>
            <option value="Contract">Contract</option>
          </select>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* View Toggler (List vs Table) */}
          <div className="view-toggler">
            <button
              className={`toggle-btn-icon ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <Grid size={16} />
            </button>
            <button
              className={`toggle-btn-icon ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          {user && user.role !== "Employee" && (
            <button className="btn btn-primary" onClick={showAddModal}>
              <UserMinus size={16} style={{ transform: "rotate(180deg)" }} />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Directory Content */}
      <div className="directory-content">
        {filteredEmployees.length > 0 ? (
          viewMode === "list" ? (
            <div className="employee-list">
              {filteredEmployees.map((emp) => (
                <div key={getEmployeeDbId(emp)} className="employee-list-item glass-card">
                  {/* Left Column: Avatar & Profile Info */}
                  <div className="list-item-profile">
                    <EmployeeAvatar emp={emp} />
                    <div className="list-item-profile-details">
                      <h3 className="list-item-name">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="list-item-designation">{emp.designation}</p>
                    </div>
                  </div>

                  {/* Middle Column: ID & Dept */}
                  <div className="list-item-work">
                    <span className="list-item-id">{emp.employeeId}</span>
                    <span className="list-item-dept">{emp.department}</span>
                  </div>

                  {/* Contact Info Column */}
                  <div className="list-item-contact">
                    <span className="list-item-email" title={emp.email}>
                      {emp.email}
                    </span>
                    <span className="list-item-phone">{emp.phone}</span>
                  </div>

                  {/* Status & Actions Column */}
                  <div className="list-item-right">
                    <span
                      className={`badge ${
                        emp.employmentStatus === "Active" ? "badge-active" : "badge-inactive"
                      }`}
                    >
                      {emp.employmentStatus === "Active" ? (
                        <ShieldCheck size={11} style={{ marginRight: 4 }} />
                      ) : (
                        <ShieldAlert size={11} style={{ marginRight: 4 }} />
                      )}
                      {emp.employmentStatus}
                    </span>

                    <div className="list-item-actions">
                      <button
                        className="btn-icon-only primary"
                        onClick={() => handleView(emp)}
                        title="View Profile"
                      >
                        <Eye size={16} />
                      </button>
                      {user && user.role !== "Employee" && (
                        <>
                          <button
                            className="btn-icon-only"
                            onClick={() => onEdit(emp)}
                            title="Edit employee"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon-only danger"
                            onClick={() => handleDeleteClick(getEmployeeDbId(emp))}
                            title="Delete employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: "auto" }}>
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Type</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={getEmployeeDbId(emp)}>
                      <td>
                        <div className="employee-profile">
                          <EmployeeAvatar emp={emp} />
                          <div className="employee-info-cell">
                            <span className="employee-name">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="employee-id-sub">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{emp.employeeId}</td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td>
                        <span
                          className={`badge badge-type ${
                            emp.employmentType
                              ? emp.employmentType.toLowerCase().replace(" ", "-")
                              : ""
                          }`}
                        >
                          {emp.employmentType}
                        </span>
                      </td>
                      <td>{formatDate(emp.joiningDate)}</td>
                      <td>
                        <span
                          className={`badge ${
                            emp.employmentStatus === "Active" ? "badge-active" : "badge-inactive"
                          }`}
                        >
                          {emp.employmentStatus === "Active" ? (
                            <ShieldCheck size={12} style={{ marginRight: 4 }} />
                          ) : (
                            <ShieldAlert size={12} style={{ marginRight: 4 }} />
                          )}
                          {emp.employmentStatus}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon-only primary"
                          onClick={() => handleView(emp)}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        {user && user.role !== "Employee" && (
                          <>
                            <button
                              className="btn-icon-only"
                              onClick={() => onEdit(emp)}
                              title="Edit employee"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon-only danger"
                              onClick={() => handleDeleteClick(getEmployeeDbId(emp))}
                              title="Delete employee"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="empty-state glass-card">
            <UserMinus size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Employees Found</h3>
            <p>We couldn't find any employees matching your search or filters.</p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm("");
                setSelectedDept("All");
                setSelectedType("All");
                setSelectedStatus("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Employee</h3>
              <button
                className="btn-icon-only"
                onClick={() => setDeleteConfirmId(null)}
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
              <AlertTriangle size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
              <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Are you absolutely sure?</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                This action cannot be undone. This will permanently delete the employee record from the system.
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: "none", paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
