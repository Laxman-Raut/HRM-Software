import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";

export const createEmployeeService = async (employeeData) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    password,
    phone,
    department,
    designation,
    joiningDate,
    employmentType,
    employmentStatus,
    salary,
    profilePhoto,
  } = employeeData;

  // Check Employee ID
  const employeeIdExists = await Employee.findOne({ employeeId });

  if (employeeIdExists) {
    throw new Error("Employee ID already exists");
  }

  // Check Email
  const emailExists = await Employee.findOne({ email });

  if (emailExists) {
    throw new Error("Email already exists");
  }

  // Check Phone
  const phoneExists = await Employee.findOne({ phone });

  if (phoneExists) {
    throw new Error("Phone number already exists");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create Employee
  const employee = await Employee.create({
    employeeId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    department,
    designation,
    joiningDate,
    employmentType,
    employmentStatus: employmentStatus || "Active",
    salary,
    profilePhoto: profilePhoto || "",
  });

  return employee;
};