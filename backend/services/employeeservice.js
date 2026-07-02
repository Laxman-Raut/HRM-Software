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
    role,
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

  // Hash Password — guard against empty/undefined password (bcrypt throws "Illegal arguments" otherwise)
  if (!password || typeof password !== "string" || password.trim() === "") {
    throw new Error("Password is required and cannot be empty");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  // salary comes as a string from multipart FormData — convert to number explicitly
  const parsedSalary = salary !== undefined && salary !== "" ? parseFloat(salary) : 0;

  const employeeRole = role || "Employee";

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
    salary: parsedSalary,
    profilePhoto: profilePhoto || "",
    role: employeeRole
  });

  return employee;
};