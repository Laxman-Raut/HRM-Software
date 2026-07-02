import Employee from "../models/Employee.js";
import { createEmployeeService } from "../services/employeeService.js";
import welcomeEmail from "../templates/employee/welcomeEmail.js";
import sendEmail from "../utils/sendEmail.js";
// Create Employee
export const createEmployee = async (req, res) => {
  try {
    const employeeData = {
      ...req.body,
      profilePhoto: req.file ? req.file.path : "",
    };


    const employee = await createEmployeeService(employeeData);
   
    try {
      await sendEmail({
        to: employee.email,
        subject: "🎉 Welcome to HRM System",
        html: welcomeEmail(employee, req.body.password || ""),
      });
    } catch (emailErr) {
      console.error("❌ Failed to send welcome email:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Get All Employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Employee By ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profilePhoto = req.file.path;
    }
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};