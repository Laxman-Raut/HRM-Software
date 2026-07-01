import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["Savings", "Current"],
      default: "Savings",
    },

    upiId: {
      type: String,
      default: "",
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BankDetails", bankDetailsSchema);