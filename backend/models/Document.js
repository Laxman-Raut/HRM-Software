import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    documentType: {
      type: String,
      enum: [
        "Aadhaar Card",
        "PAN Card",
        "Resume",
        "Passport Photo",
        "Degree Certificate",
        "Experience Letter",
        "Offer Letter",
        "Relieving Letter",
        "Other",
      ],
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },

    remarks: {
      type: String,
      default: "",
    },

    verifiedBy: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Document", documentSchema);