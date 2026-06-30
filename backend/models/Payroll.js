import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    workingDays: {
      type: Number,
      default: 0,
    },

    presentDays: {
      type: Number,
      default: 0,
    },

    leaveDays: {
      type: Number,
      default: 0,
    },

    absentDays: {
      type: Number,
      default: 0,
    },

    grossSalary: {
      type: Number,
      default: 0,
    },

    totalDeduction: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Generated", "Paid"],
      default: "Pending",
    },

    paidDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Payroll", payrollSchema);