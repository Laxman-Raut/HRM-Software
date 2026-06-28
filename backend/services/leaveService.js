import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";

export const createLeaveService = async (leaveData) => {
  const {
    employee,
    leaveType,
    startDate,
    endDate,
    reason,
  } = leaveData;

  // Check Employee
  const employeeExists = await Employee.findById(employee);

  if (!employeeExists) {
    throw new Error("Employee not found");
  }

  // Validate Dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new Error("End date cannot be before start date");
  }

  // Calculate Total Days
  const totalDays =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Create Leave
  const leave = await Leave.create({
    employee,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
  });

  return leave;
};