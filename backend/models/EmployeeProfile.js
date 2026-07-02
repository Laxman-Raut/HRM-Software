import mongoose from "mongoose";

const employeeProfileSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
    },

    nationality: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    zipCode: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    linkedin: String,

    github: String,

    website: String,

    profilePhoto: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EmployeeProfile", employeeProfileSchema);