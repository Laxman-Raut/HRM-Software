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

      if (user) {
        // Explicitly set the role on req.user from token payload or fallback
        user.role = decoded.role || (user.email && user.email.endsWith("admin@gmail.com") ? "Admin" : "Employee");
      }

      req.user = user;
      req.admin = user && decoded.role !== "Employee" ? user : null;

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