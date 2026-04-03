import mongoose from "mongoose";

/**
 * Course Model — updated to link with Department and AcademicYear/Semester.
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: true,
      trim:     true,
    },
    description: {
      type:    String,
      default: "",
      trim:    true,
    },
    instructor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    duration: {
      type:     String,
      required: true,
      trim:     true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "User",
      },
    ],
    rating: {
      type:    Number,
      default: 4.5,
      min:     0,
      max:     5,
    },
    status: {
      type:    String,
      enum:    ["active", "completed", "archived", "pending_approval"],
      default: "active",
    },
    image: {
      type:    String,
      default: "",
    },

    // ── NEW: College structure fields ──────────────────────────
    department: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Department",
      default: null,
    },
    academicYear: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "AcademicYear",
      default: null,
    },
    // The semester number this course belongs to (1–8)
    semesterNumber: {
      type:    Number,
      min:     1,
      max:     8,
      default: null,
    },
    // Subject / course code, e.g. "CS301"
    subjectCode: {
      type:    String,
      trim:    true,
      default: "",
    },
    // Credit hours
    credits: {
      type:    Number,
      default: 0,
      min:     0,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
courseSchema.index({ department: 1, semesterNumber: 1 });
courseSchema.index({ academicYear: 1 });

export default mongoose.model("Course", courseSchema);