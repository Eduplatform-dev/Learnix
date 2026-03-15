import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
{
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

course: {
type: mongoose.Schema.Types.ObjectId,
ref: "Course",
required: true,
},

instructor: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},

dueDate: {
type: Date,
required: true,
},

maxMarks: {
type: Number,
default: 100,
},

attachments: {
type: String,
default: "",
},

},
{
timestamps: true,
}
);

export default mongoose.model("Assignment", assignmentSchema);
