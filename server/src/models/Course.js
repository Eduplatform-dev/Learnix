import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    instructor: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    students: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Not Started"],
      default: "Not Started",
    },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
