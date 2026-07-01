import React, { useState, useEffect } from "react";
import {
  Coins,
  Search,
  Plus,
  Trash2,
  Eye,
  Printer,
  Check,
  FileText,
  Calendar,
  DollarSign,
  User,
  Activity,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import "./PayrollPage.css";
import { getEmployeeDbId } from "../utils/idResolver";
import { BASE_URL } from "../config";

const API_PAYROLL = `${BASE_URL}/api/payroll`;
const API_SALARY = `${BASE_URL}/api/salary-structures`;

export default function PayrollPage({ user, employees }) {
  const isEmployee = user && user.role === "Employee";
  const isAdminOrHr = user && user.role !== "Employee";

  // Navigation state
  const [activeTab, setActiveTab] = useState("payrolls");

  // Data states
  const [payrolls, setPayrolls] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [mySalaryStructure, setMySalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Action states
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null); // null = Add, object = Edit
  const [selectedPayslip, setSelectedPayslip] = useState(null); // for viewing payslip modal

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  // Salary Structure Form
  const [salaryForm, setSalaryForm] = useState({
    employee: "",
    basicSalary: "",
    hra: 0,
    da: 0,
    medicalAllowance: 0,
    travelAllowance: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    professionalTax: 0,
    incomeTax: 0,
    effectiveFrom: "",
  });

  // Generate Payroll Form
  const [generateForm, setGenerateForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    workingDays: 30,
    presentDays: 30,
    leaveDays: 0,
    absentDays: 0,
  });

  const [toast, setToast] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const resolvedUserId = getEmployeeDbId(user);

      if (isEmployee) {
        // Fetch employee's own payrolls & structures
        const [payrollsRes, salaryRes] = await Promise.all([
          fetch(`${API_PAYROLL}/employee/${resolvedUserId}`, { headers }),
          fetch(`${API_SALARY}/employee/${resolvedUserId}`, { headers }),
        ]);

        const payrollsData = await payrollsRes.json();
        const salaryData = await salaryRes.json();

        if (payrollsRes.ok && payrollsData.success) {
          setPayrolls(payrollsData.data || []);
        }
        if (salaryRes.ok && salaryData.success) {
          setMySalaryStructure(salaryData.data || null);
        }
      } else {
        // Fetch all payrolls & structures for Admin/HR
        const [payrollsRes, salaryRes] = await Promise.all([
          fetch(API_PAYROLL, { headers }),
          fetch(API_SALARY, { headers }),
        ]);

        const payrollsData = await payrollsRes.json();
        const salaryData = await salaryRes.json();

        if (payrollsRes.ok && payrollsData.success) {
          setPayrolls(payrollsData.data || []);
        }
        if (salaryRes.ok && salaryData.success) {
          setSalaryStructures(salaryData.data || []);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to retrieve payroll records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Salary Structure Form Submit
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!salaryForm.employee || !salaryForm.basicSalary || !salaryForm.effectiveFrom) {
      showToast("Employee, Basic Salary, and Effective Date are required.", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const isEdit = !!selectedStructure;
      const url = isEdit ? `${API_SALARY}/${selectedStructure._id}` : API_SALARY;
      const method = isEdit ? "PUT" : "POST";

      const body = {
        ...salaryForm,
        basicSalary: Number(salaryForm.basicSalary),
        hra: Number(salaryForm.hra),
        da: Number(salaryForm.da),
        medicalAllowance: Number(salaryForm.medicalAllowance),
        travelAllowance: Number(salaryForm.travelAllowance),
        specialAllowance: Number(salaryForm.specialAllowance),
        pf: Number(salaryForm.pf),
        esi: Number(salaryForm.esi),
        professionalTax: Number(salaryForm.professionalTax),
        incomeTax: Number(salaryForm.incomeTax),
      };

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast(
          isEdit ? "Salary structure updated successfully!" : "Salary structure created successfully!",
          "success"
        );
        setSalaryModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || "Failed to save salary structure.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error. Failed to save salary structure.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Salary Structure
  const handleDeleteStructure = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary structure?")) return;

    try {
      const response = await fetch(`${API_SALARY}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Salary structure deleted.", "success");
        fetchData();
      } else {
        showToast(data.message || "Failed to delete structure.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to delete salary structure.", "error");
    }
  };

  // Open Salary Structure Form Modal
  const openSalaryModal = (structure = null) => {
    setSelectedStructure(structure);
    if (structure) {
      setSalaryForm({
        employee: getEmployeeDbId(structure.employee) || structure.employee,
        basicSalary: structure.basicSalary,
        hra: structure.hra || 0,
        da: structure.da || 0,
        medicalAllowance: structure.medicalAllowance || 0,
        travelAllowance: structure.travelAllowance || 0,
        specialAllowance: structure.specialAllowance || 0,
        pf: structure.pf || 0,
        esi: structure.esi || 0,
        professionalTax: structure.professionalTax || 0,
        incomeTax: structure.incomeTax || 0,
        effectiveFrom: structure.effectiveFrom ? structure.effectiveFrom.split("T")[0] : "",
      });
    } else {
      setSalaryForm({
        employee: "",
        basicSalary: "",
        hra: 0,
        da: 0,
        medicalAllowance: 0,
        travelAllowance: 0,
        specialAllowance: 0,
        pf: 0,
        esi: 0,
        professionalTax: 0,
        incomeTax: 0,
        effectiveFrom: new Date().toISOString().split("T")[0],
      });
    }
    setSalaryModalOpen(true);
  };

  // Generate Payroll Submit
  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    if (!generateForm.employeeId) {
      showToast("Please select an employee.", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_PAYROLL}/generate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...generateForm,
          month: Number(generateForm.month),
          year: Number(generateForm.year),
          workingDays: Number(generateForm.workingDays),
          presentDays: Number(generateForm.presentDays),
          leaveDays: Number(generateForm.leaveDays),
          absentDays: Number(generateForm.absentDays),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Payroll generated successfully!", "success");
        // Reset form
        setGenerateForm((prev) => ({
          ...prev,
          employeeId: "",
        }));
        setActiveTab("payrolls");
        fetchData();
      } else {
        showToast(data.message || "Failed to generate payroll.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to generate payroll.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Update Payroll Status (Pending -> Paid)
  const handleUpdatePayrollStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_PAYROLL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(`Payroll status updated to ${newStatus}!`, "success");
        fetchData();
      } else {
        showToast(data.message || "Failed to update payroll status.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to update status.", "error");
    }
  };

  // Delete Payroll
  const handleDeletePayroll = async (id) => {
    if (!window.confirm("Are you sure you want to delete/revert this payroll record?")) return;

    try {
      const response = await fetch(`${API_PAYROLL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Payroll record deleted.", "success");
        fetchData();
      } else {
        showToast(data.message || "Failed to delete payroll.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to delete payroll record.", "error");
    }
  };

  // Check if selected employee already has a structure configured
  const getSelectedEmployeeStructure = (empId) => {
    if (!empId) return null;
    return salaryStructures.find((struct) => {
      const structureEmpId = getEmployeeDbId(struct.employee) || struct.employee;
      return structureEmpId === empId;
    });
  };

  // Filter generated payrolls
  const filteredPayrolls = payrolls.filter((payroll) => {
    const employeeName = payroll.employee
      ? `${payroll.employee.firstName} ${payroll.employee.lastName}`.toLowerCase()
      : "";
    const employeeId = payroll.employee ? payroll.employee.employeeId.toLowerCase() : "";

    const matchesSearch =
      employeeName.includes(searchQuery.toLowerCase()) ||
      employeeId.includes(searchQuery.toLowerCase());

    const matchesMonth =
      filterMonth === "All" || payroll.month === Number(filterMonth);
    const matchesYear =
      filterYear === "All" || payroll.year === Number(filterYear);

    return matchesSearch && matchesMonth && matchesYear;
  });

  const getMonthName = (monthNum) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNum - 1] || monthNum;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="payroll-page-container">
      {/* Toast Alert */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="payroll-header">
        <div className="title-desc">
          <div className="icon-badge">
            <Coins size={22} className="header-icon" />
          </div>
          <div>
            <h1>Payroll & Salary</h1>
            <p>Manage compensation models, review payouts, and issue employee payslips.</p>
          </div>
        </div>
        {isAdminOrHr && activeTab === "salaryStructures" && (
          <button className="btn btn-primary" onClick={() => openSalaryModal()}>
            <Plus size={16} /> Configure Structure
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="tabs-navigation">
        <button
          className={`tab-btn ${activeTab === "payrolls" ? "active" : ""}`}
          onClick={() => setActiveTab("payrolls")}
        >
          <FileText size={16} /> Payroll History
        </button>

        {isAdminOrHr ? (
          <>
            <button
              className={`tab-btn ${activeTab === "salaryStructures" ? "active" : ""}`}
              onClick={() => setActiveTab("salaryStructures")}
            >
              <Coins size={16} /> Salary Structures
            </button>
            <button
              className={`tab-btn ${activeTab === "generate" ? "active" : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              <Calendar size={16} /> Generate Payroll
            </button>
          </>
        ) : (
          <button
            className={`tab-btn ${activeTab === "myStructure" ? "active" : ""}`}
            onClick={() => setActiveTab("myStructure")}
          >
            <Coins size={16} /> My Salary Structure
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="tab-pane-content">
        {loading ? (
          <div className="payroll-loader">
            <div className="spinner-loader"></div>
            <span>Syncing payroll database...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: PAYROLL HISTORY LIST */}
            {activeTab === "payrolls" && (
              <div className="history-tab-pane">
                {/* Filters Row (Admin Only) */}
                {isAdminOrHr && (
                  <div className="payroll-filters-card">
                    <div className="search-box">
                      <Search size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search employee name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="dropdowns-group">
                      <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                      >
                        <option value="All">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {getMonthName(m)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                      >
                        <option value="All">All Years</option>
                        {[2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {filteredPayrolls.length === 0 ? (
                  <div className="payroll-empty-state">
                    <FileText size={48} className="empty-icon" />
                    <h3>No payroll records found</h3>
                    <p>
                      {isAdminOrHr
                        ? "Run a payroll generation cycle to see records here."
                        : "No payslip history is available for your profile yet."}
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="employee-table">
                      <thead>
                        <tr>
                          {isAdminOrHr && <th>Employee</th>}
                          <th>Period</th>
                          <th>Gross Salary</th>
                          <th>Deductions</th>
                          <th>Net Payout</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayrolls.map((payroll) => (
                          <tr key={payroll._id}>
                            {isAdminOrHr && (
                              <td>
                                <div className="employee-profile">
                                  <div className="user-avatar-sm">
                                    <User size={16} />
                                  </div>
                                  <div>
                                    <span className="emp-name">
                                      {payroll.employee
                                        ? `${payroll.employee.firstName} ${payroll.employee.lastName}`
                                        : "Unknown Staff"}
                                    </span>
                                    <span className="emp-id">
                                      {payroll.employee ? payroll.employee.employeeId : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            )}
                            <td>
                              <span className="period-badge">
                                {getMonthName(payroll.month)} {payroll.year}
                              </span>
                            </td>
                            <td>{formatCurrency(payroll.grossSalary)}</td>
                            <td className="deductions-pills">
                              -{formatCurrency(payroll.totalDeduction)}
                            </td>
                            <td className="font-bold net-pay-cell">
                              {formatCurrency(payroll.netSalary)}
                            </td>
                            <td>
                              <span className={`status-pill ${payroll.status?.toLowerCase()}`}>
                                {payroll.status || "Pending"}
                              </span>
                            </td>
                            <td className="text-right">
                              <div className="actions-flex justify-end gap-2" >
                                <button
                                style={{backgroundColor: "blue"}}
                                  className="btn-table-action"
                                  title="View Payslip"
                                  onClick={() => setSelectedPayslip(payroll)}
                                >
                                  <Eye size={14} /> Payslip
                                </button>
                                {isAdminOrHr && payroll.status !== "Paid" && (
                                  <button
                                    className="btn-table-action btn-success-action"
                                    title="Mark as Paid"
                                    onClick={() =>
                                      handleUpdatePayrollStatus(payroll._id, "Paid")
                                    }
                                  >
                                    <Check size={14} /> Mark Paid
                                  </button>
                                )}
                                {isAdminOrHr && (
                                  <button
                                    className="btn-table-action btn-danger-action"
                                    title="Revert/Delete Record"
                                    onClick={() => handleDeletePayroll(payroll._id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SALARY STRUCTURES (ADMIN/HR ONLY) */}
            {activeTab === "salaryStructures" && isAdminOrHr && (
              <div className="salary-structures-pane">
                {salaryStructures.length === 0 ? (
                  <div className="payroll-empty-state">
                    <Coins size={48} className="empty-icon" />
                    <h3>No structures configured</h3>
                    <p>Start setting up individual salary breakdowns for staff members.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="employee-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Basic Pay</th>
                          <th>Allowance Sum</th>
                          <th>Deduction Sum</th>
                          <th>Base Net Payout</th>
                          <th>Effective From</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryStructures.map((struct) => {
                          const allowancesSum =
                            (struct.hra || 0) +
                            (struct.da || 0) +
                            (struct.medicalAllowance || 0) +
                            (struct.travelAllowance || 0) +
                            (struct.specialAllowance || 0);

                          const deductionsSum =
                            (struct.pf || 0) +
                            (struct.esi || 0) +
                            (struct.professionalTax || 0) +
                            (struct.incomeTax || 0);

                          const netBasePayout =
                            struct.basicSalary + allowancesSum - deductionsSum;

                          return (
                            <tr key={struct._id}>
                              <td>
                                <div className="employee-profile">
                                  <div className="user-avatar-sm">
                                    <User size={16} />
                                  </div>
                                  <div>
                                    <span className="emp-name">
                                      {struct.employee
                                        ? `${struct.employee.firstName} ${struct.employee.lastName}`
                                        : "Unknown Staff"}
                                    </span>
                                    <span className="emp-id">
                                      {struct.employee ? struct.employee.employeeId : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>{formatCurrency(struct.basicSalary)}</td>
                              <td className="allowance-text">
                                +{formatCurrency(allowancesSum)}
                              </td>
                              <td className="deductions-pills">
                                -{formatCurrency(deductionsSum)}
                              </td>
                              <td className="font-bold">
                                {formatCurrency(netBasePayout)}
                              </td>
                              <td>
                                {struct.effectiveFrom
                                  ? new Date(struct.effectiveFrom).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="text-right">
                                <div className="actions-flex justify-end gap-2">
                                  <button
                                    className="btn-table-action"
                                    onClick={() => openSalaryModal(struct)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn-table-action btn-danger-action"
                                    onClick={() => handleDeleteStructure(struct._id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GENERATE PAYROLL (ADMIN/HR ONLY) */}
            {activeTab === "generate" && isAdminOrHr && (
              <div className="generate-payroll-pane">
                <div className="generate-grid-scaffold">
                  <div className="card-custom form-card">
                    <div className="card-header-inner">
                      <h3>Payroll Generation Form</h3>
                      <p>Run a monthly salary computation cycle for an employee.</p>
                    </div>

                    <form onSubmit={handleGeneratePayroll} className="generate-payout-form">
                      <div className="form-group">
                        <label>Select Employee</label>
                        <select
                          required
                          value={generateForm.employeeId}
                          onChange={(e) =>
                            setGenerateForm((prev) => ({
                              ...prev,
                              employeeId: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Choose Employee --</option>
                          {employees.map((emp) => {
                            const empId = getEmployeeDbId(emp);
                            return (
                              <option key={empId} value={empId}>
                                {emp.firstName} {emp.lastName} ({emp.employeeId})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {generateForm.employeeId && (
                        <>
                          {!getSelectedEmployeeStructure(generateForm.employeeId) ? (
                            <div className="form-alert error-alert">
                              <p>
                                <strong>Warning:</strong> This employee does not have a configured salary structure.
                                You must set up their salary first.
                              </p>
                              <button
                                type="button"
                                className="btn btn-secondary mt-2"
                                onClick={() => {
                                  openSalaryModal();
                                  setSalaryForm((prev) => ({
                                    ...prev,
                                    employee: generateForm.employeeId,
                                  }));
                                }}
                              >
                                Configure Salary Now
                              </button>
                            </div>
                          ) : (
                            <div className="form-alert success-alert">
                              <p>
                                <strong>Salary Confirmed:</strong> Base pay:{" "}
                                {formatCurrency(
                                  getSelectedEmployeeStructure(generateForm.employeeId)
                                    .basicSalary
                                )}
                                /month.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      <div className="form-row-double">
                        <div className="form-group">
                          <label>Month</label>
                          <select
                            value={generateForm.month}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                month: e.target.value,
                              }))
                            }
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <option key={m} value={m}>
                                {getMonthName(m)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Year</label>
                          <input
                            type="number"
                            required
                            min="2025"
                            max="2035"
                            value={generateForm.year}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                year: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="form-row-double">
                        <div className="form-group">
                          <label>Total Working Days</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="31"
                            value={generateForm.workingDays}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                workingDays: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Present Days</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="31"
                            value={generateForm.presentDays}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                presentDays: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="form-row-double">
                        <div className="form-group">
                          <label>Paid Leave Days</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="31"
                            value={generateForm.leaveDays}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                leaveDays: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Absent Days</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="31"
                            value={generateForm.absentDays}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                absentDays: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-full-width"
                        disabled={
                          submitLoading ||
                          !generateForm.employeeId ||
                          !getSelectedEmployeeStructure(generateForm.employeeId)
                        }
                      >
                        {submitLoading ? "Processing Computation..." : "Compute & Generate Paycheck"}
                      </button>
                    </form>
                  </div>

                  <div className="metrics-side-card">
                    <div className="card-custom secondary-card">
                      <h3>Payroll Summary Info</h3>
                      <p className="mt-2 text-muted">
                        Generating payroll pulls the active salary components, adds all allowances, subtracts tax/PF deductions, and generates a payslip with state "Generated".
                      </p>

                      <div className="info-pills-list mt-4">
                        <div className="info-pill-item">
                          <Activity size={18} className="item-icon green" />
                          <div>
                            <span className="p-title">Base Gross Formula</span>
                            <span className="p-desc">Basic + HRA + DA + Allowances</span>
                          </div>
                        </div>

                        <div className="info-pill-item">
                          <TrendingDown size={18} className="item-icon red" />
                          <div>
                            <span className="p-title">Deduction Items</span>
                            <span className="p-desc">PF + ESI + Taxes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EMPLOYEE OWN SALARY VIEW */}
            {activeTab === "myStructure" && isEmployee && (
              <div className="employee-own-structure-pane">
                {!mySalaryStructure ? (
                  <div className="payroll-empty-state">
                    <Coins size={48} className="empty-icon" />
                    <h3>No Salary Structure Assigned</h3>
                    <p>Your compensation model has not been set up in the system yet. Please contact HR.</p>
                  </div>
                ) : (
                  <div className="salary-card-premium">
                    <div className="card-top-glow"></div>
                    <div className="structure-card-header">
                      <div>
                        <h2>Your Compensation Breakdown</h2>
                        <p>Effective from: {new Date(mySalaryStructure.effectiveFrom).toLocaleDateString()}</p>
                      </div>
                      <div className="base-badge">
                        <span>Base: {formatCurrency(mySalaryStructure.basicSalary)}</span>
                      </div>
                    </div>

                    <div className="structure-parts-grid">
                      <div className="column-section-part">
                        <h4 className="section-title-lbl green">Monthly Allowances</h4>
                        <div className="detail-rows-container">
                          <div className="item-row">
                            <span>Basic Salary</span>
                            <span className="amount-val">{formatCurrency(mySalaryStructure.basicSalary)}</span>
                          </div>
                          <div className="item-row">
                            <span>House Rent Allowance (HRA)</span>
                            <span className="amount-val">{formatCurrency(mySalaryStructure.hra)}</span>
                          </div>
                          <div className="item-row">
                            <span>Dearness Allowance (DA)</span>
                            <span className="amount-val">{formatCurrency(mySalaryStructure.da)}</span>
                          </div>
                          <div className="item-row">
                            <span>Medical Allowance</span>
                            <span className="amount-val">{formatCurrency(mySalaryStructure.medicalAllowance)}</span>
                          </div>
                          <div className="item-row">
                            <span>Travel Allowance</span>
                            <span className="amount-val">{formatCurrency(mySalaryStructure.travelAllowance)}</span>
                          </div>
                          <div className="item-row">
                            <span>Special Allowance</span>
                            <span className="amount-val">{formatCurrency(mySalaryStructure.specialAllowance)}</span>
                          </div>
                          <div className="total-divider"></div>
                          <div className="item-row total-row green-text">
                            <span>Total Base Gross</span>
                            <span>
                              {formatCurrency(
                                mySalaryStructure.basicSalary +
                                (mySalaryStructure.hra || 0) +
                                (mySalaryStructure.da || 0) +
                                (mySalaryStructure.medicalAllowance || 0) +
                                (mySalaryStructure.travelAllowance || 0) +
                                (mySalaryStructure.specialAllowance || 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="column-section-part">
                        <h4 className="section-title-lbl red">Monthly Deductions</h4>
                        <div className="detail-rows-container">
                          <div className="item-row">
                            <span>Provident Fund (PF)</span>
                            <span className="amount-val">-{formatCurrency(mySalaryStructure.pf)}</span>
                          </div>
                          <div className="item-row">
                            <span>Employee State Insurance (ESI)</span>
                            <span className="amount-val">-{formatCurrency(mySalaryStructure.esi)}</span>
                          </div>
                          <div className="item-row">
                            <span>Professional Tax</span>
                            <span className="amount-val">-{formatCurrency(mySalaryStructure.professionalTax)}</span>
                          </div>
                          <div className="item-row">
                            <span>Income Tax (TDS)</span>
                            <span className="amount-val">-{formatCurrency(mySalaryStructure.incomeTax)}</span>
                          </div>
                          <div className="total-divider"></div>
                          <div className="item-row total-row red-text">
                            <span>Total Base Deductions</span>
                            <span>
                              -{formatCurrency(
                                (mySalaryStructure.pf || 0) +
                                (mySalaryStructure.esi || 0) +
                                (mySalaryStructure.professionalTax || 0) +
                                (mySalaryStructure.incomeTax || 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="net-take-home-bar">
                      <div className="flex-between">
                        <div>
                          <span className="net-title">Base Net Take-Home Salary</span>
                          <p className="subtext">Excludes any attendance/unpaid leaves adjustments</p>
                        </div>
                        <div className="net-amount">
                          {formatCurrency(
                            mySalaryStructure.basicSalary +
                            (mySalaryStructure.hra || 0) +
                            (mySalaryStructure.da || 0) +
                            (mySalaryStructure.medicalAllowance || 0) +
                            (mySalaryStructure.travelAllowance || 0) +
                            (mySalaryStructure.specialAllowance || 0) -
                            ((mySalaryStructure.pf || 0) +
                              (mySalaryStructure.esi || 0) +
                              (mySalaryStructure.professionalTax || 0) +
                              (mySalaryStructure.incomeTax || 0))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: CONFIGURE/EDIT SALARY STRUCTURE */}
      {salaryModalOpen && (
        <div className="modal-backdrop">
          <div className="custom-modal salary-structure-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedStructure ? "Edit Salary Structure" : "Configure Salary Structure"}
              </h3>
              <button className="close-btn" onClick={() => setSalaryModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSalarySubmit} className="modal-form">
              <div className="form-group">
                <label>Select Employee</label>
                <select
                  required
                  disabled={!!selectedStructure}
                  value={salaryForm.employee}
                  onChange={(e) =>
                    setSalaryForm((prev) => ({
                      ...prev,
                      employee: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => {
                    const empId = getEmployeeDbId(emp);
                    return (
                      <option key={empId} value={empId}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-row-double">
                <div className="form-group">
                  <label>Basic Monthly Salary</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Enter basic pay amount..."
                    value={salaryForm.basicSalary}
                    onChange={(e) =>
                      setSalaryForm((prev) => ({
                        ...prev,
                        basicSalary: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Effective From</label>
                  <input
                    type="date"
                    required
                    value={salaryForm.effectiveFrom}
                    onChange={(e) =>
                      setSalaryForm((prev) => ({
                        ...prev,
                        effectiveFrom: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="salary-fields-split">
                <div className="modal-sub-section border-right pr-3">
                  <h4 className="green-text mb-3">Allowances</h4>
                  <div className="form-group">
                    <label>House Rent Allowance (HRA)</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.hra}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          hra: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Dearness Allowance (DA)</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.da}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          da: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Medical Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.medicalAllowance}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          medicalAllowance: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Travel Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.travelAllowance}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          travelAllowance: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Special Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.specialAllowance}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          specialAllowance: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="modal-sub-section pl-3">
                  <h4 className="red-text mb-3">Deductions</h4>
                  <div className="form-group">
                    <label>Provident Fund (PF)</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.pf}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          pf: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Employee State Insurance (ESI)</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.esi}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          esi: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Professional Tax</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.professionalTax}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          professionalTax: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Income Tax (TDS)</label>
                    <input
                      type="number"
                      min="0"
                      value={salaryForm.incomeTax}
                      onChange={(e) =>
                        setSalaryForm((prev) => ({
                          ...prev,
                          incomeTax: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions pt-3 border-top mt-4 flex justify-between gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSalaryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? "Saving..." : "Save Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW/PRINT PAYSLIP POPUP */}
      {selectedPayslip && (
        <div className="modal-backdrop">
          <div className="custom-modal payslip-view-modal">
            <div className="modal-header hide-on-print">
              <h3 className="modal-title">Payslip Viewer</h3>
              <div className="header-actions">
                <button className="btn btn-secondary mr-2" onClick={() => window.print()}>
                  <Printer size={16} /> Print Payslip
                </button>
                <button className="close-btn" onClick={() => setSelectedPayslip(null)}>
                  &times;
                </button>
              </div>
            </div>

            <div id="payslip-print-area" className="payslip-sheet">
              {/* Payslip Header Info */}
              <div className="payslip-top-section">
                <div className="company-info-block">
                  <h2>HRM Software Ltd.</h2>
                  <p>100 Technology Way, Silicon Valley, CA 94025</p>
                  <p>Contact: payroll@hrmsoft.com | Web: www.hrmsoft.com</p>
                </div>
                <div className="payslip-date-stamp">
                  <h3>PAYSLIP</h3>
                  <span className="sub-lbl-stamp">
                    For the month of {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                  </span>
                </div>
              </div>

              <div className="divider-line"></div>

              {/* Employee & Payout Details Grid */}
              <div className="payslip-meta-grid">
                <div className="meta-col">
                  <div className="meta-item">
                    <span className="lbl">Employee Name:</span>
                    <span className="val">
                      {selectedPayslip.employee
                        ? `${selectedPayslip.employee.firstName} ${selectedPayslip.employee.lastName}`
                        : "Unknown Staff"}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Employee ID:</span>
                    <span className="val">
                      {selectedPayslip.employee ? selectedPayslip.employee.employeeId : "N/A"}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Department:</span>
                    <span className="val">
                      {selectedPayslip.employee ? selectedPayslip.employee.department : "N/A"}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Designation:</span>
                    <span className="val">
                      {selectedPayslip.employee ? selectedPayslip.employee.designation : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="meta-col">
                  <div className="meta-item">
                    <span className="lbl">Working Days:</span>
                    <span className="val">{selectedPayslip.workingDays}</span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Days Present:</span>
                    <span className="val">{selectedPayslip.presentDays}</span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Leaves Taken:</span>
                    <span className="val">{selectedPayslip.leaveDays}</span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Status / Paid Date:</span>
                    <span className="val">
                      <span className={`status-pill ${selectedPayslip.status?.toLowerCase()}`}>
                        {selectedPayslip.status || "Pending"}
                      </span>
                      {selectedPayslip.paidDate && (
                        <span className="date-paid-text font-small ml-2">
                          ({new Date(selectedPayslip.paidDate).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider-line"></div>

              {/* Earnings & Deductions Tables */}
              <div className="payslip-breakdown-wrapper">
                <div className="breakdown-column">
                  <div className="column-header green-bg">Earnings</div>
                  <div className="item-row-detail">
                    <span>Basic Salary</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.basicSalary)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>House Rent Allowance (HRA)</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.hra)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Dearness Allowance (DA)</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.da)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Medical Allowance</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.medicalAllowance)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Travel Allowance</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.travelAllowance)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Special Allowance</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.specialAllowance)}</span>
                  </div>
                  <div className="total-payout-row pt-2 mt-2">
                    <span>Total Earnings (Gross)</span>
                    <span className="font-bold">{formatCurrency(selectedPayslip.grossSalary)}</span>
                  </div>
                </div>

                <div className="breakdown-column border-left pl-3">
                  <div className="column-header red-bg">Deductions</div>
                  <div className="item-row-detail">
                    <span>Provident Fund (PF)</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.pf)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Employee State Insurance (ESI)</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.esi)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Professional Tax</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.professionalTax)}</span>
                  </div>
                  <div className="item-row-detail">
                    <span>Income Tax (TDS)</span>
                    <span>{formatCurrency(selectedPayslip.salaryStructure?.incomeTax)}</span>
                  </div>
                  <div className="total-payout-row pt-2 mt-2">
                    <span>Total Deductions</span>
                    <span className="font-bold">-{formatCurrency(selectedPayslip.totalDeduction)}</span>
                  </div>
                </div>
              </div>

              <div className="divider-line"></div>

              {/* Net Payout Summary */}
              <div className="net-salary-summary-callout">
                <div className="take-home-title-desc">
                  <h3>Net Payout Amount</h3>
                  <p>This payout matches details finalized in the payroll record.</p>
                </div>
                <div className="large-net-amount">
                  {formatCurrency(selectedPayslip.netSalary)}
                </div>
              </div>

              <div className="payslip-signatures mt-5">
                <div className="sig-block">
                  <p className="sig-line"></p>
                  <span>HR Manager Signature</span>
                </div>
                <div className="sig-block">
                  <p className="sig-line"></p>
                  <span>Employee Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
