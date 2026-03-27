import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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

instructor: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},

duration: {
type: String,
required: true,
trim: true,
},

enrolledStudents: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "User",
}
],

rating: {
type: Number,
default: 4.5,
min: 0,
max: 5,
},

status: {
type: String,
enum: ["active", "completed", "archived"],
default: "active",
},

image: {
type: String,
default: "",
},
},
{
timestamps: true,
}
);

export default mongoose.model("Course", courseSchema);
