import Payroll from "../models/Payroll.js";
import SalaryStructure from "../models/SalaryStructure.js";
import Employee from "../models/Employee.js";

export const generatePayroll = async (req, res) => {
  try {

    const {
      employeeId,
      month,
      year,
      workingDays,
      presentDays,
      leaveDays,
      absentDays,
    } = req.body;

    // Check Employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check Salary Structure
    const salary = await SalaryStructure.findOne({
      employee: employeeId,
    });

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    // Prevent duplicate payroll
    const existingPayroll = await Payroll.findOne({
      employee: employeeId,
      month,
      year,
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: "Payroll already generated.",
      });
    }

    // Gross Salary
    const grossSalary =
      salary.basicSalary +
      salary.hra +
      salary.da +
      salary.medicalAllowance +
      salary.travelAllowance +
      salary.specialAllowance;

    // Total Deduction
    const totalDeduction =
      salary.pf +
      salary.esi +
      salary.professionalTax +
      salary.incomeTax;

    // Net Salary
    const netSalary = grossSalary - totalDeduction;

    const payroll = await Payroll.create({
      employee: employeeId,
      salaryStructure: salary._id,

      month,
      year,

      workingDays,
      presentDays,
      leaveDays,
      absentDays,

      grossSalary,
      totalDeduction,
      netSalary,

      status: "Generated",
    });

    res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      data: payroll,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// GET ALL PAYROLLS
export const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employee", "employeeId firstName lastName email department designation")
      .populate("salaryStructure")
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET EMPLOYEE PAYROLLS
export const getEmployeePayrolls = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Authorization check: Employees can only fetch their own payroll records
    if (req.user.role === "Employee" && req.user._id.toString() !== employeeId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only access your own payroll details.",
      });
    }

    const payrolls = await Payroll.find({ employee: employeeId })
      .populate("employee", "employeeId firstName lastName email department designation")
      .populate("salaryStructure")
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PAYROLL STATUS
export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Generated", "Paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be Pending, Generated, or Paid.",
      });
    }

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    payroll.status = status;
    if (status === "Paid") {
      payroll.paidDate = new Date();
    } else {
      payroll.paidDate = null;
    }

    await payroll.save();

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate("employee", "employeeId firstName lastName email department designation")
      .populate("salaryStructure");

    res.status(200).json({
      success: true,
      message: `Payroll status updated to ${status} successfully.`,
      data: updatedPayroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PAYROLL RECORD
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    await payroll.deleteOne();

    res.status(200).json({
      success: true,
      message: "Payroll record deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};