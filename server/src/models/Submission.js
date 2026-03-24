import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Assignment",
      required: true,
    },
    assignmentTitle: {
      type:    String,
      default: "",   // not required — gets filled server-side
    },
    course: {
      type:    String,
      default: "",
    },
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    studentName: {
      type:    String,
      default: "",
    },

    /* Submission content */
    title:       { type: String, default: "" },
    description: { type: String, default: "" },
    text:        { type: String, default: "" },

    /* Uploaded files */
    files: [
      {
        originalName: String,
        filename:     String,
        url:          String,
        size:         Number,
      },
    ],

    /* Grading */
    grade:    { type: String, default: null },
    feedback: { type: String, default: "" },
    gradedAt: { type: Date,   default: null },
    gradedBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },

    status: {
      type:    String,
      enum:    ["draft", "submitted", "graded"],
      default: "draft",
    },
  },
  { timestamps: true }
);

/* Indexes for common queries */
submissionSchema.index({ studentId: 1, createdAt: -1 });
submissionSchema.index({ assignmentId: 1 });
submissionSchema.index({ status: 1 });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
