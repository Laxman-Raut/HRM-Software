import React from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function EmployeeCardList({
  employees,
  getEmployeeDbId,
  handleView,
  onEdit,
  handleDeleteClick,
  user,
}) {
  return (
    <div className="employee-list">
      {employees.map((emp) => (
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
          <div className="list-item-status-actions">
            <span
              className={`badge ${
                emp.employmentStatus === "Active" ? "badge-active" : "badge-inactive"
              }`}
            >
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
              {user && (user.role === "Admin" || user.role === "HR") && (
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
  );
}
