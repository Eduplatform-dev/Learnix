import mongoose from "mongoose";

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
    // FIX: restored hodId field — departmentController.js populates this
    hodId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },
    // FIX: added totalIntake — referenced in departmentController createDepartment
    totalIntake: {
      type:    Number,
      default: 0,
      min:     0,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);