import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    // Employee who applied for leave
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Type of leave
    leaveType: {
      type: String,
      enum: [
        "Casual",
        "Sick",
        "Annual",
        "Maternity",
        "Paternity",
        "Unpaid",
        "Other",
      ],
      required: true,
    },

    // Leave duration
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // Total leave days
    totalDays: {
      type: Number,
      required: true,
    },

    // Reason
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Leave Status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // HR/Admin Remarks
    remark: {
      type: String,
      default: "",
    },

    // Who approved/rejected
    approvedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    approvedByRole: {
      type: String,
      enum: ["Admin", "HR"],
      default: null,
    },

    approvedByName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Leave", leaveSchema);