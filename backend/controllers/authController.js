import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let role;

    // Check Admin / HR / Manager
    user = await Admin.findOne({ email });

    if (user) {
      role = user.role;
    } else {
      // Check Employee
      user = await Employee.findOne({ email });

      if (user) {
        const isHrDept = user.department === "HR";
        const isHrDesignation = user.designation && /hr|human resource|admin/i.test(user.designation);
        role = (isHrDept || isHrDesignation) ? "HR" : (user.role || "Employee");
      }
    }

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role,
      user: {
        id: user._id,
        email: user.email,
        role,
        employeeId: user.employeeId || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || "Admin"),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};