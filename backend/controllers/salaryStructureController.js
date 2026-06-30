import SalaryStructure from "../models/SalaryStructure.js";
import Employee from "../models/Employee.js";

export const createSalaryStructure = async (req, res) => {
  try {
    const {
      employee,
      basicSalary,
      hra,
      da,
      medicalAllowance,
      travelAllowance,
      specialAllowance,
      pf,
      esi,
      professionalTax,
      incomeTax,
      effectiveFrom,
    } = req.body;

    // Check employee exists
    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Only one salary structure per employee
    const existingSalary = await SalaryStructure.findOne({ employee });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: "Salary structure already exists for this employee.",
      });
    }

    const salary = await SalaryStructure.create({
      employee,
      basicSalary,
      hra,
      da,
      medicalAllowance,
      travelAllowance,
      specialAllowance,
      pf,
      esi,
      professionalTax,
      incomeTax,
      effectiveFrom,
    });

    res.status(201).json({
      success: true,
      message: "Salary structure created successfully.",
      data: salary,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllSalaryStructures = async (req, res) => {
  try {
    const salaries = await SalaryStructure.find()
      .populate(
        "employee",
        "employeeId firstName lastName email department designation"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSalaryStructureByEmployee = async (req, res) => {
  try {
    const salary = await SalaryStructure.findOne({
      employee: req.params.employeeId,
    }).populate(
      "employee",
      "employeeId firstName lastName email department designation"
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: salary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSalaryStructure = async (req, res) => {
  try {
    const salary = await SalaryStructure.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found.",
      });
    }

    Object.assign(salary, req.body);

    await salary.save();

    res.status(200).json({
      success: true,
      message: "Salary structure updated successfully.",
      data: salary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSalaryStructure = async (req, res) => {
  try {
    const salary = await SalaryStructure.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found.",
      });
    }

    await salary.deleteOne();

    res.status(200).json({
      success: true,
      message: "Salary structure deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};