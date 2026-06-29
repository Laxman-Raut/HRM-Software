import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";

export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

      // Get user from DB (Admin or Employee)
      let user = await Admin.findById(decoded.id).select("-password");
      if (!user) {
        user = await Employee.findById(decoded.id).select("-password");
      }

      // If user was deleted from DB but token is still valid
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      // Always trust the role from the JWT — prevents HR being downgraded to Employee
      user.role = decoded.role || user.role || "Employee";

      req.user = user;
      req.admin = decoded.role !== "Employee" ? user : null;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};