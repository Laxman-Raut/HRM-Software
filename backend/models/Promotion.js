import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    previousDesignation: {
      type: String,
      required: true,
    },

    newDesignation: {
      type: String,
      required: true,
    },

    previousDepartment: {
      type: String,
      required: true,
    },

    newDepartment: {
      type: String,
      required: true,
    },

    previousSalary: {
      type: Number,
      default: 0,
    },

    newSalary: {
      type: Number,
      required: true,
    },

    promotionTitle: {
      type: String,
      required: true,
      trim: true,
    },

    effectiveDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    promotedByName: {
      type: String,
    },

    promotedByRole: {
      type: String,
      enum: ["Admin", "HR"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Promotion", promotionSchema);