import mongoose from "mongoose";

/**
 * Department model.
 *
 * FIX: removed the `hod` field entirely.
 * The old model had `hod` (field name), but departmentController.js and
 * departmentRoutes.js both referenced `hodId` (different name), which caused
 * populate() to silently fail and the HOD to never appear in responses.
 *
 * Since the onboarding form and routes don't currently use HOD, removing it
 * eliminates the mismatch. Add it back as a single consistent field name
 * when HOD management is properly implemented.
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
      unique:   true,
    },
    code: {
      type:      String,
      required:  true,
      trim:      true,
      uppercase: true,
      unique:    true,
    },
    description: {
      type:    String,
      default: "",
      trim:    true,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);