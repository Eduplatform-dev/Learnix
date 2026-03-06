import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";

dotenv.config();

const ADMIN_EMAIL = "admin@learnix.com";
const ADMIN_PASSWORD = "admin123";

const STUDENT_EMAIL = "student@learnix.com";
const STUDENT_PASSWORD = "student123";

async function seed() {
  await connectDB();

  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    admin = await User.create({
      email: ADMIN_EMAIL,
      username: "Admin",
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    });

    // eslint-disable-next-line no-console
    console.log(`✅ Created admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  let student = await User.findOne({ role: "student" });
  if (!student) {
    student = await User.create({
      email: STUDENT_EMAIL,
      username: "Student",
      password: await bcrypt.hash(STUDENT_PASSWORD, 10),
      role: "student",
    });

    // eslint-disable-next-line no-console
    console.log(
      `✅ Created student: ${STUDENT_EMAIL} / ${STUDENT_PASSWORD}`
    );
  }

  const existingCourses = await Course.countDocuments();
  if (existingCourses === 0) {
    await Course.insertMany([
      {
        title: "React Fundamentals",
        instructor: "Dr. Smith",
        duration: "6 weeks",
        students: 120,
        rating: 4.7,
        progress: 35,
        status: "In Progress",
        image: "",
      },
      {
        title: "Data Structures & Algorithms",
        instructor: "Prof. Kumar",
        duration: "8 weeks",
        students: 200,
        rating: 4.8,
        progress: 0,
        status: "Not Started",
        image: "",
      },
      {
        title: "Database Management Systems",
        instructor: "Ms. Rao",
        duration: "5 weeks",
        students: 150,
        rating: 4.6,
        progress: 100,
        status: "Completed",
        image: "",
      },
    ]);

    // eslint-disable-next-line no-console
    console.log("✅ Seeded sample courses");
  }

  const existingAssignments = await Assignment.countDocuments();
  if (existingAssignments === 0 && student) {
    const due1 = new Date();
    due1.setDate(due1.getDate() + 7);

    const due2 = new Date();
    due2.setDate(due2.getDate() + 14);

    await Assignment.insertMany([
      {
        title: "Build a Todo App",
        course: "React Fundamentals",
        dueDate: due1.toISOString().slice(0, 10),
        type: "Project",
        status: "Not Started",
        priority: "high",
        userId: student._id.toString(),
      },
      {
        title: "Linked List Quiz",
        course: "Data Structures & Algorithms",
        dueDate: due2.toISOString().slice(0, 10),
        type: "Quiz",
        status: "In Progress",
        priority: "medium",
        userId: student._id.toString(),
      },
    ]);

    // eslint-disable-next-line no-console
    console.log("✅ Seeded sample assignments");
  }

  const existingContent = await Content.countDocuments();
  if (existingContent === 0) {
    await Content.insertMany([
      {
        title: "Welcome Guide (PDF)",
        type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        uploadedBy: admin?._id,
      },
      {
        title: "Sample Lecture Video",
        type: "video",
        url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        uploadedBy: admin?._id,
      },
      {
        title: "Course Banner Image",
        type: "image",
        url: "https://via.placeholder.com/800x450.png?text=Learnix",
        uploadedBy: admin?._id,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log("✅ Seeded sample content");
  }

  await mongoose.connection.close();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  process.exit(1);
});

