import Leave from "../models/Leave.js";

export const createLeaveService = async (leaveData) => {
  const {
    employee,
    leaveType,
    startDate,
    endDate,
    reason,
  } = leaveData;

  // Validate required fields
  if (!employee) {
    throw new Error("Employee reference is required");
  }

  if (!leaveType) {
    throw new Error("Leave type is required");
  }

  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  if (!reason || !reason.trim()) {
    throw new Error("Reason is required");
  }

  // Validate Dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

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