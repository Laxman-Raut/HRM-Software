import mongoose from "mongoose";

const warningSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    status: {
      type: String,
      enum: ["Active", "Resolved"],
      default: "Active",
    },

    warningDate: {
      type: Date,
      default: Date.now,
    },

    issuedById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    issuedByRole: {
      type: String,
      enum: ["Admin", "HR"],
      required: true,
    },

    issuedByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Warning", warningSchema);