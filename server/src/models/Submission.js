// server/src/models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    assignmentTitle: { type: String, required: true },
    course: { type: String, default: "" },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: { type: String, default: "" },

    /* Submission content */
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    text: { type: String, default: "" },

    /* Uploaded files — stored as relative paths under /uploads */
    files: [
      {
        originalName: String,
        filename: String,    // saved filename on disk
        url: String,         // public URL
        size: Number,
      },
    ],

    /* Grading */
    grade: { type: String, default: null },        // e.g. "85/100" or "A"
    feedback: { type: String, default: "" },
    gradedAt: { type: Date, default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    status: {
      type: String,
      enum: ["draft", "submitted", "graded"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
