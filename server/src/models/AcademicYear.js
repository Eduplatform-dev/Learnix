import mongoose from "mongoose";

/**
 * AcademicYear Model
 * e.g.  { label: "2024-25", startDate: 2024-07-01, endDate: 2025-06-30 }
 *
 * Semesters are embedded inside as a sub-array so the whole structure
 * lives in one document and is easy to query.
 *
 * Semester numbers follow common Indian college convention:
 *   Odd  semesters (1, 3, 5, 7) → July – November
 *   Even semesters (2, 4, 6, 8) → December – May
 */

const semesterSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Semester 1", "Semester 2"
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const academicYearSchema = new mongoose.Schema(
  {
    label: {
      type:      String,
      required:  true,
      unique:    true,
      trim:      true,
      // e.g. "2024-25"
    },
    startDate: {
      type:     Date,
      required: true,
    },
    endDate: {
      type:     Date,
      required: true,
    },
    isCurrent: {
      type:    Boolean,
      default: false,
      // Only one year should have isCurrent: true.
      // Enforced at application level in the controller.
    },
    semesters: {
      type:    [semesterSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Ensure only one AcademicYear has isCurrent = true
academicYearSchema.pre("save", async function (next) {
  if (this.isCurrent && this.isModified("isCurrent")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

export default mongoose.model("AcademicYear", academicYearSchema);