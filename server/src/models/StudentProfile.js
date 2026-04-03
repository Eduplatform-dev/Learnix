import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Academic
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      default: null,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    division: {
      type: String,
      trim: true,
      default: "",
    },
    rollNumber: {
      type: String,
      trim: true,
      default: "",
    },
    admissionYear: {
      type: Number,
      required: true,
    },

    // Personal
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
      default: "unknown",
    },
    photo: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city:   { type: String, default: "" },
      state:  { type: String, default: "" },
      pincode:{ type: String, default: "" },
    },

    // Parent / Guardian
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    parentPhone: {
      type: String,
      trim: true,
      default: "",
    },
    parentEmail: {
      type: String,
      trim: true,
      default: "",
    },
    parentOccupation: {
      type: String,
      trim: true,
      default: "",
    },

    // Category
    category: {
      type: String,
      enum: ["general", "obc", "sc", "st", "nt", "other"],
      default: "general",
    },

    // Submission is locked once submitted
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentProfile", studentProfileSchema);
