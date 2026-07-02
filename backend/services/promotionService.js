import Promotion from "../models/Promotion.js";
import Employee from "../models/Employee.js";
export const createPromotionService = async (
  employeeId,
  promotionData,
  currentUser
) => {
  // Find Employee
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Create Promotion History
  const promotion = await Promotion.create({
    employee: employee._id,

    previousDesignation: employee.designation,
    newDesignation: promotionData.newDesignation,

    previousDepartment: employee.department,
    newDepartment: promotionData.newDepartment,

    previousSalary: employee.salary || 0,
    newSalary: promotionData.newSalary,

    promotionTitle: promotionData.promotionTitle,
    effectiveDate: promotionData.effectiveDate,
    reason: promotionData.reason,
    remarks: promotionData.remarks,

    promotedBy: currentUser._id,
    promotedByName:
      currentUser.name || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "System",
    promotedByRole: currentUser.role,
  });

  // Update Employee Details
  employee.designation = promotionData.newDesignation;
  employee.department = promotionData.newDepartment;

  employee.salary = promotionData.newSalary;

  await employee.save();

  return await Promotion.findById(promotion._id).populate(
    "employee",
    "firstName lastName employeeId email designation department"
  );
};