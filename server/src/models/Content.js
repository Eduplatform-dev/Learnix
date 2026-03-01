import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: String,
    status: String,
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
