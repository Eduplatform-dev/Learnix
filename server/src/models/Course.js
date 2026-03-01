import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    duration: String,
    level: String,
    image: String,
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
