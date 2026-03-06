import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
