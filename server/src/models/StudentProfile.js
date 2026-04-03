import mongoose from "mongoose";

/**
 * StudentProfile — filled once at first login, locked after submission.
 * Only admins can edit after submission.
 */
const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* ── Academic ──────────────────────────────────────────────── */
    enrollmentNumber: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      default: null,
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
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
      default: null,
    },

    /* ── Personal ──────────────────────────────────────────────── */
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown", ""],
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
      street:  { type: String, default: "" },
      city:    { type: String, default: "" },
      state:   { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    category: {
      type: String,
      enum: ["general", "obc", "sc", "st", "nt", "other", ""],
      default: "general",
    },

    /* ── Parent / Guardian ─────────────────────────────────────── */
    parentName: {
      type: String,
      trim: true,
      default: "",
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

    /* ── Submission lock ───────────────────────────────────────── */
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

// Sparse unique index on enrollmentNumber — allows multiple empty strings
studentProfileSchema.index(
  { enrollmentNumber: 1 },
  { unique: true, sparse: true, partialFilterExpression: { enrollmentNumber: { $gt: "" } } }
);

export default mongoose.model("StudentProfile", studentProfileSchema);