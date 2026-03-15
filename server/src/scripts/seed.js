import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";

dotenv.config();

async function seed() {

await connectDB();

/* ================= USERS ================= */

let admin = await User.findOne({ role: "admin" });

if (!admin) {

```
admin = await User.create({
  email: "admin@learnix.com",
  username: "Admin",
  password: await bcrypt.hash("admin123", 10),
  role: "admin",
});

console.log("✅ Admin created");
```

}

let student = await User.findOne({ role: "student" });

if (!student) {

```
student = await User.create({
  email: "student@learnix.com",
  username: "Student",
  password: await bcrypt.hash("student123", 10),
  role: "student",
});

console.log("✅ Student created");
```

}

/* ================= COURSES ================= */

if (await Course.countDocuments() === 0) {

```
const courses = await Course.insertMany([
  {
    title: "React Fundamentals",
    description: "Learn React basics",
    instructor: admin._id,
    duration: "6 weeks",
  },
  {
    title: "Data Structures",
    description: "Learn DSA",
    instructor: admin._id,
    duration: "8 weeks",
  },
]);

console.log("✅ Courses seeded");
```

}

/* ================= ASSIGNMENTS ================= */

if (await Assignment.countDocuments() === 0) {

```
const course = await Course.findOne();

await Assignment.create({
  title: "React Todo App",
  description: "Build a Todo app using React",
  course: course._id,
  instructor: admin._id,
  dueDate: new Date(),
  maxMarks: 100,
});

console.log("✅ Assignment seeded");
```

}

/* ================= CONTENT ================= */

if (await Content.countDocuments() === 0) {

```
await Content.create({
  title: "Welcome Guide",
  type: "pdf",
  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  uploadedBy: admin._id,
});

console.log("✅ Content seeded");
```

}

await mongoose.connection.close();

}

seed().catch(err => {
console.error(err);
process.exit(1);
});
