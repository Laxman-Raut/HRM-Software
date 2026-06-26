import { body } from "express-validator";

export const createEmployeeValidation = [
  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required"),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required"),

  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required"),

  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required"),

  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Salary cannot be negative"),
];