import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["National", "Festival", "Company", "Optional"],
      default: "Company",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Holiday", holidaySchema);