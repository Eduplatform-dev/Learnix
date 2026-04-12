import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    student:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    date:       { type: Date, required: true },
    reason:     { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote:   { type: String, default: "" },
    reviewedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ student: 1, course: 1, date: 1 });
leaveRequestSchema.index({ course: 1, status: 1 });

export default mongoose.model("LeaveRequest", leaveRequestSchema);