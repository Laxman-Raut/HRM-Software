import React from "react";

export default function EmployeeFormFields({ formData, handleChange, errors, isEdit }) {
  return (
    <div className="form-grid">
      {/* Employee ID */}
      <div className="form-group">
        <label className="form-label">Employee ID *</label>
        <input
          type="text"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          placeholder="e.g. EMP-101"
          className="form-control"
          disabled={isEdit}
        />
        {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
      </div>



      {/* First Name */}
      <div className="form-group">
        <label className="form-label">First Name *</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="John"
          className="form-control"
        />
        {errors.firstName && <span className="form-error">{errors.firstName}</span>}
      </div>

      {/* Last Name */}
      <div className="form-group">
        <label className="form-label">Last Name *</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Doe"
          className="form-control"
        />
        {errors.lastName && <span className="form-error">{errors.lastName}</span>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john.doe@company.com"
          className="form-control"
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      {/* Password */}
      {!isEdit && (
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="form-control"
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>
      )}

      {/* Phone */}
      <div className="form-group">
        <label className="form-label">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 019-2834"
          className="form-control"
        />
        {errors.phone && <span className="form-error">{errors.phone}</span>}
      </div>

      {/* Department */}
      <div className="form-group">
        <label className="form-label">Department *</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="form-control"
          style={{ cursor: "pointer" }}
        >
          <option value="">Select Department</option>
          <option value="HR">HR</option>
          <option value="IT">IT</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="Accounts">Accounts</option>
          <option value="Operations">Operations</option>
        </select>
        {errors.department && <span className="form-error">{errors.department}</span>}
      </div>

      {/* Designation */}
      <div className="form-group">
        <label className="form-label">Designation *</label>
        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Senior Software Engineer"
          className="form-control"
        />
        {errors.designation && <span className="form-error">{errors.designation}</span>}
      </div>

      {/* Joining Date */}
      <div className="form-group">
        <label className="form-label">Joining Date *</label>
        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
          className="form-control"
        />
        {errors.joiningDate && <span className="form-error">{errors.joiningDate}</span>}
      </div>

      {/* Salary */}
      <div className="form-group">
        <label className="form-label">Salary (INR/year)</label>
        <input
          type="number"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="95000"
          className="form-control"
          min="0"
        />
        {errors.salary && <span className="form-error">{errors.salary}</span>}
      </div>

      {/* Employment Type */}
      <div className="form-group">
        <label className="form-label">Employment Type</label>
        <select
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          className="form-control"
          style={{ cursor: "pointer" }}
        >
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Intern">Intern</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      {/* Employment Status */}
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          name="employmentStatus"
          value={formData.employmentStatus}
          onChange={handleChange}
          className="form-control"
          style={{ cursor: "pointer" }}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}
