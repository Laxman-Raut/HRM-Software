import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Employee Check In
export const checkIn = async (req, res) => {
  try {
    let { employeeId } = req.body;

    // Auto-resolve employeeId if role is Employee
    if (!employeeId && req.user && req.user.role === "Employee") {
      employeeId = req.user.employeeId;
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Find employee
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Today's date
    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const attendanceExists = await Attendance.findOne({
      employeeId,
      date: today,
    });

    if (attendanceExists) {
      return res.status(400).json({
        success: false,
        message: "Employee already checked in today",
      });
    }

    // Current time
    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create attendance
    const attendance = await Attendance.create({
      employee: employee._id,
      employeeId: employee.employeeId,
      date: today,
      checkIn: currentTime,
      status: "Present",
    });

    res.status(201).json({
      success: true,
      message: "Check In Successful",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee Check Out
export const checkOut = async (req, res) => {
  try {
    let { employeeId } = req.body;

    // Auto-resolve employeeId if role is Employee
    if (!employeeId && req.user && req.user.role === "Employee") {
      employeeId = req.user.employeeId;
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Find employee
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Today's date
    const today = new Date().toISOString().split("T")[0];

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Employee must check in before checking out",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Employee already checked out today",
      });
    }

    // Current time
    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    attendance.checkOut = currentTime;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check Out Successful",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Today's Status
export const getTodayStatus = async (req, res) => {
  try {
    let employeeId = req.query.employeeId;

    if (!employeeId && req.user && req.user.role === "Employee") {
      employeeId = req.user.employeeId;
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    res.status(200).json({
      success: true,
      data: attendance || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Attendance History
export const getAttendanceHistory = async (req, res) => {
  try {
    let query = {};

    // If logged-in user is an Employee, they can only view their own history
    if (req.user && req.user.role === "Employee") {
      query.employeeId = req.user.employeeId;
    } else {
      // If admin, they can optionally filter by employeeId or date
      if (req.query.employeeId) {
        query.employeeId = req.query.employeeId;
      }
      if (req.query.date) {
        query.date = req.query.date;
      }
    }

    const history = await Attendance.find(query)
      .populate("employee", "firstName lastName department designation employeeId profilePhoto")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Attendance Stats
export const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    if (req.user && req.user.role === "Employee") {
      // Employee stats
      const employeeId = req.user.employeeId;
      const records = await Attendance.find({ employeeId });
      const presentCount = records.filter(r => r.status === "Present").length;
      const halfDayCount = records.filter(r => r.status === "Half Day").length;

      res.status(200).json({
        success: true,
        data: {
          totalDays: records.length,
          present: presentCount,
          halfDay: halfDayCount,
          absent: 0,
        }
      });
    } else {
      // Admin stats
      const activeEmployeesCount = await Employee.countDocuments({ employmentStatus: "Active" });
      const todayAttendance = await Attendance.find({ date: today });

      const presentCount = todayAttendance.filter(r => r.status === "Present").length;
      const halfDayCount = todayAttendance.filter(r => r.status === "Half Day").length;
      const checkedInCount = todayAttendance.length;
      const absentCount = Math.max(0, activeEmployeesCount - checkedInCount);

      res.status(200).json({
        success: true,
        data: {
          totalActiveEmployees: activeEmployeesCount,
          presentToday: presentCount,
          halfDayToday: halfDayCount,
          absentToday: absentCount,
          checkedInToday: checkedInCount,
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};