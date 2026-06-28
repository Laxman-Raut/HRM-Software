import React from "react";
import { Search, Grid, List, UserMinus } from "lucide-react";

export default function DirectoryToolbar({
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  departments,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  user,
  showAddModal,
}) {
  return (
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
          {departments.filter((d) => d !== "All").map((dept) => (
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
  );
}
