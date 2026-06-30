import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    resignationDate: {
      type: Date,
      default: Date.now,
    },

    lastWorkingDay: {
      type: Date,
      required: true,
    },

    noticePeriod: {
      type: Number,
      default: 30,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },

    hrRemarks: {
      type: String,
      default: "",
    },

    approvedBy: {
      type: String,
      default: "",
    },

    approvedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resignation", resignationSchema);