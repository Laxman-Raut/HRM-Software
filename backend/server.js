import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({
      email: "admin@gmail.com",
    });

    if (adminExists) {
      console.log("Default Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Admin.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    console.log(" Default Admin Created Successfully");
  } catch (error) {
    console.log("Error creating default admin:", error.message);
  }
};

createDefaultAdmin();
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});