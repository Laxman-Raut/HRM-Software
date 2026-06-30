import mongoose from "mongoose";

const salaryStructureSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    basicSalary: {
      type: Number,
      required: true,
    },

    hra: {
      type: Number,
      default: 0,
    },

    da: {
      type: Number,
      default: 0,
    },

    medicalAllowance: {
      type: Number,
      default: 0,
    },

    travelAllowance: {
      type: Number,
      default: 0,
    },

    specialAllowance: {
      type: Number,
      default: 0,
    },

    pf: {
      type: Number,
      default: 0,
    },

    esi: {
      type: Number,
      default: 0,
    },

    professionalTax: {
      type: Number,
      default: 0,
    },

    incomeTax: {
      type: Number,
      default: 0,
    },

    effectiveFrom: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SalaryStructure", salaryStructureSchema);