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