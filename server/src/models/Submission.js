import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
{
assignmentId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Assignment",
required: true,
},

studentId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},

title: {
type: String,
required: true,
trim: true,
},

description: {
type: String,
default: "",
trim: true,
},

fileUrl: {
type: String,
required: true,
},

grade: {
type: Number,
default: null,
min: 0,
},

feedback: {
type: String,
default: "",
trim: true,
},

status: {
type: String,
enum: ["submitted", "graded"],
default: "submitted",
},

},
{
timestamps: true,
}
);

export default mongoose.model("Submission", submissionSchema);
