import React from "react";
import { Eye, Edit2, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import EmployeeAvatar from "../Common/EmployeeAvatar";

export default function EmployeeTable({
  employees,
  getEmployeeDbId,
  handleView,
  onEdit,
  handleDeleteClick,
  user,
  formatDate,
}) {
  return (
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
          {employees.map((emp) => (
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
  );
}
