import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: String,
    course: String,
    dueDate: String,
    type: String,
    status: String,
    priority: String,
    userId: String,
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
