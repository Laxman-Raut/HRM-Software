import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
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

    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    createdByRole: {
      type: String,
      enum: ["Admin", "HR", "Manager"],
      required: true,
    },

    targetAudience: {
      type: String,
      enum: ["ALL", "HR", "Manager", "Employee"],
      default: "ALL",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Announcement", announcementSchema);