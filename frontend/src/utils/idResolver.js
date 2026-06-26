/**
 * Robustly extracts the string ID from an employee object.
 * Handles:
 * 1. Mongoose String ID (`emp._id`)
 * 2. Virtual String ID (`emp.id`)
 * 3. MongoDB Extended JSON ID (`emp._id.$oid` or `emp.id.$oid`)
 * 
 * @param {Object} emp - The employee data object.
 * @returns {string} The resolved string identifier.
 */
export function getEmployeeDbId(emp) {
  if (!emp) return "";
  
  // Check _id field first
  if (emp._id) {
    if (typeof emp._id === "string") {
      return emp._id;
    }
    if (typeof emp._id === "object" && emp._id.$oid) {
      return emp._id.$oid;
    }
  }

  // Fallback to id field
  if (emp.id) {
    if (typeof emp.id === "string") {
      return emp.id;
    }
    if (typeof emp.id === "object" && emp.id.$oid) {
      return emp.id.$oid;
    }
  }

  // Fallback to employeeId if nothing else matches (as a last resort string)
  if (emp.employeeId && typeof emp.employeeId === "string") {
    return emp.employeeId;
  }

  return "";
}
