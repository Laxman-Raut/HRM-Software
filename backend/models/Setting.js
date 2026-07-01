import mongoose from "mongoose";

const roleSettingSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["Admin", "HR", "Manager", "Employee"],
  },
  maxLeavesPerYear: {
    type: Number,
    default: 15,
  },
  canApproveLeaves: {
    type: Boolean,
    default: false,
  },
  canManageAttendance: {
    type: Boolean,
    default: false,
  },
  canManagePayroll: {
    type: Boolean,
    default: false,
  },
  canCreateAnnouncements: {
    type: Boolean,
    default: false,
  },
  canIssueWarnings: {
    type: Boolean,
    default: false,
  },
  workFromHomeAllowed: {
    type: Boolean,
    default: false,
  },
});

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "HRM Portal",
    },
    supportEmail: {
      type: String,
      default: "support@company.com",
    },
    currency: {
      type: String,
      default: "USD",
    },
    allowEmployeeRegistration: {
      type: Boolean,
      default: false,
    },
    themeMode: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    themeColor: {
      type: String,
      enum: ["zinc", "blue", "emerald", "amber", "violet"],
      default: "blue",
    },
    smtpHost: {
      type: String,
      default: "",
    },
    smtpPort: {
      type: Number,
      default: 587,
    },
    smtpUser: {
      type: String,
      default: "",
    },
    smtpPass: {
      type: String,
      default: "",
    },
    roleSettings: [roleSettingSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Setting", settingSchema);
