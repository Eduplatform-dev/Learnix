import mongoose from "mongoose";
import Course from "../models/Course.js";

/* ================= GET ALL COURSES ================= */

export const getCourses = async (req, res) => {
try {

const courses = await Course
  .find()
  .populate("instructor", "username email")
  .sort({ createdAt: -1 });

res.json(courses);

} catch (err) {

res.status(500).json({ error: "Server error" });

}
};

/* ================= GET COURSE BY ID ================= */

export const getCourseById = async (req, res) => {
try {

const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid course ID" });
}

const course = await Course
  .findById(id)
  .populate("instructor", "username email")
  .populate("enrolledStudents", "username email");

if (!course) {
  return res.status(404).json({ error: "Course not found" });
}

res.json(course);

} catch (err) {

res.status(500).json({ error: "Server error" });

}
};

/* ================= CREATE COURSE ================= */

export const createCourse = async (req, res) => {
try {

const { title, description, duration, image } = req.body;

if (!title || !duration) {
  return res.status(400).json({ error: "Title and duration required" });
}

const course = await Course.create({
  title: title.trim(),
  description: description?.trim() || "",
  duration: duration.trim(),
  image: image || "",
  instructor: req.user._id,
});

res.status(201).json(course);

} catch (err) {

res.status(500).json({ error: "Server error" });

}
};

/* ================= UPDATE COURSE ================= */

export const updateCourse = async (req, res) => {
try {

const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid course ID" });
}

const updated = await Course.findByIdAndUpdate(
  id,
  req.body,
  {
    new: true,
    runValidators: true,
  }
);

if (!updated) {
  return res.status(404).json({ error: "Course not found" });
}

res.json(updated);

} catch (err) {

res.status(500).json({ error: "Server error" });

}
};

/* ================= DELETE COURSE ================= */

export const deleteCourse = async (req, res) => {
try {

const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid course ID" });
}

const deleted = await Course.findByIdAndDelete(id);

if (!deleted) {
  return res.status(404).json({ error: "Course not found" });
}

res.json({ message: "Course deleted successfully" });


} catch (err) {


res.status(500).json({ error: "Server error" });


}
};

/* ================= ENROLL COURSE ================= */

export const enrollCourse = async (req, res) => {
try {


const { id } = req.params;
const userId = req.user._id;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid course ID" });
}

const course = await Course.findById(id);

if (!course) {
  return res.status(404).json({ error: "Course not found" });
}

if (course.enrolledStudents.includes(userId)) {
  return res.status(400).json({ error: "Already enrolled in this course" });
}

course.enrolledStudents.push(userId);

await course.save();

res.json({ message: "Successfully enrolled in course" });

} catch (err) {

res.status(500).json({ error: "Server error" });

}
};
