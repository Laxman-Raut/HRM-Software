import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email ? email.toLowerCase() : "";

    let user;
    let role;

  
    user = await Admin.findOne({ email: lowerEmail });

    if (user) {
      role = user.role;
    } else {
      user = await Employee.findOne({ email: lowerEmail });

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerEmail = email ? email.toLowerCase() : "";

    // Check if email exists in Admin
    let user = await Admin.findOne({ email: lowerEmail });
    let isAdmin = true;

    if (!user) {
      // Check if email exists in Employee
      user = await Employee.findOne({ email: lowerEmail });
      isAdmin = false;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token in database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const name = isAdmin ? user.name : user.firstName;

    // Email
    const html = `
      <h2>Password Reset</h2>

      <p>Hello ${name},</p>

      <p>You requested a password reset.</p>

      <a href="${resetUrl}">
        Click here to reset your password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid token in Admin or Employee
    let user = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      user = await Employee.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Clear reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};