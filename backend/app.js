import express from "express";
import cors from "cors";
import EmployeeRoutes from "./routes/EmployeeRoutes.js";
import AuthRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import warningRoutes from "./routes/WarningRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HRM Backend API is Running 🚀",
  });
});

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/employees", EmployeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/warnings", warningRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;