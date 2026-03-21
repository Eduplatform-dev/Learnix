import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";
import Fee from "../models/Fee.js";

dotenv.config();

async function seed() {
  await connectDB();

  /* ================= USERS ================= */

  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    admin = await User.create({
      email: "admin@learnix.com",
      username: "Admin",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    console.log("✅ Admin created");
  }

  let student = await User.findOne({ role: "student" });
  if (!student) {
    student = await User.create({
      email: "student@learnix.com",
      username: "Student",
      password: await bcrypt.hash("student123", 10),
      role: "student",
    });
    console.log("✅ Student created");
  }

  /* ================= COURSES ================= */

  let courses = await Course.find();
  if (courses.length === 0) {
    courses = await Course.insertMany([
      {
        title: "React Fundamentals",
        description: "Learn React basics including hooks, state management, and component patterns.",
        instructor: admin._id,
        duration: "6 weeks",
        rating: 4.8,
        status: "active",
        enrolledStudents: [student._id],
      },
      {
        title: "Data Structures & Algorithms",
        description: "Master essential data structures and algorithm design techniques.",
        instructor: admin._id,
        duration: "8 weeks",
        rating: 4.6,
        status: "active",
        enrolledStudents: [student._id],
      },
      {
        title: "Node.js & Express",
        description: "Build scalable backend APIs with Node.js and Express framework.",
        instructor: admin._id,
        duration: "5 weeks",
        rating: 4.7,
        status: "active",
      },
    ]);
    console.log("✅ Courses seeded");
  }

  const course = courses[0];

  /* ================= ASSIGNMENTS ================= */

  if (await Assignment.countDocuments() === 0) {
    await Assignment.insertMany([
      {
        title: "React Todo App",
        description: "Build a fully functional Todo app using React hooks and local state management.",
        course: course._id,
        instructor: admin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxMarks: 100,
      },
      {
        title: "Binary Search Tree",
        description: "Implement a Binary Search Tree with insert, search, and traversal methods.",
        course: courses[1]?._id || course._id,
        instructor: admin._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxMarks: 100,
      },
    ]);
    console.log("✅ Assignments seeded");
  }

  /* ================= CONTENT ================= */

  if (await Content.countDocuments() === 0) {
    await Content.insertMany([
      {
        title: "React Hooks Guide",
        type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        course: String(course._id),
        uploadedBy: admin._id,
      },
      {
        title: "Welcome to Learnix",
        type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        uploadedBy: admin._id,
      },
    ]);
    console.log("✅ Content seeded");
  }

  /* ================= FEES ================= */

  if (await Fee.countDocuments({ student: student._id }) === 0) {
    const now = new Date();

    await Fee.insertMany([
      {
        student: student._id,
        description: "Tuition Fee - Spring 2026",
        amount: 2850.00,
        status: "paid",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        invoice: "INV-2026-001",
        semester: "Spring 2026",
        category: "tuition",
      },
      {
        student: student._id,
        description: "Technology Fee",
        amount: 250.00,
        status: "paid",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        invoice: "INV-2026-002",
        semester: "Spring 2026",
        category: "technology",
      },
      {
        student: student._id,
        description: "Tuition Fee - Summer 2026",
        amount: 2850.00,
        status: "pending",
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        invoice: "INV-2026-003",
        semester: "Summer 2026",
        category: "tuition",
      },
      {
        student: student._id,
        description: "Lab Fee",
        amount: 200.00,
        status: "pending",
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        invoice: "INV-2026-004",
        semester: "Summer 2026",
        category: "lab",
      },
    ]);
    console.log("✅ Fees seeded");
  }

  await mongoose.connection.close();
  console.log("\n🎉 Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Admin:   admin@learnix.com   / admin123");
  console.log("  Student: student@learnix.com / student123");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
