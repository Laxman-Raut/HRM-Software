import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected");

    // Drop legacy unique index 'user_1' if it exists to prevent duplicate key errors
    try {
      const employeesCollection = mongoose.connection.collection("employees");
      const indexes = await employeesCollection.indexes();
      if (indexes.some((idx) => idx.name === "user_1")) {
        await employeesCollection.dropIndex("user_1");
        console.log(" Legacy index 'user_1' dropped successfully");
      }
    } catch (indexErr) {
      console.warn(" Warning: Could not verify/drop legacy index 'user_1':", indexErr.message);
    }

    // Seed default admin if database is empty
    try {
      const Admin = (await import("../models/Admin.js")).default;
      const bcrypt = (await import("bcryptjs")).default;
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await Admin.create({
          name: "HR Admin",
          email: "admin@hrm.com",
          password: hashedPassword,
        });
        console.log(" Default Admin created: admin@hrm.com / admin123");
      }
    } catch (err) {
      console.error(" Failed to seed default admin:", err.message);
    }

  } catch (error) {
    console.error("Database Connection fail:", error.message);
    process.exit(1);
  }
};

export default connectDB;