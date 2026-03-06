import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["video", "pdf", "image"],
      required: true,
    },
    url: { type: String, required: true },
    // Optional links for "lessons" view
    course: { type: String, default: null },
    folder: { type: String, default: null },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    filePath: { type: String, default: null },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
