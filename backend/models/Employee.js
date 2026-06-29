import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      enum: [
        "HR",
        "IT",
        "Sales",
        "Marketing",
        "Finance",
        "Accounts",
        "Operations",
      ],
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Intern", "Contract"],
      default: "Full-Time",
    },

    employmentStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    salary: {
      type: Number,
      default: 0,
    },

    profilePhoto: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "Employee",
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Employee", employeeSchema);