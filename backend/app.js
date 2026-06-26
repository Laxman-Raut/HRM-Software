import express from "express";
import cors from "cors";
import EmployeeRoutes from "./routes/EmployeeRoutes.js";
import AuthRoutes from "./routes/authRoutes.js";

const app = express(); // ✅ FIRST create app

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

export default app;