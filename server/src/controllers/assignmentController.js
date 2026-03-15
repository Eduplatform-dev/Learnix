import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";

/* ================= GET ASSIGNMENTS ================= */

export const getAssignments = async (req, res) => {
try {

```
const assignments = await Assignment
  .find()
  .populate("course", "title")
  .populate("instructor", "username email")
  .sort({ createdAt: -1 });

res.json(assignments);
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}
};

/* ================= GET ASSIGNMENT BY ID ================= */

export const getAssignmentById = async (req, res) => {

try {

```
const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid assignment ID" });
}

const assignment = await Assignment
  .findById(id)
  .populate("course", "title")
  .populate("instructor", "username email");

if (!assignment) {
  return res.status(404).json({ error: "Assignment not found" });
}

res.json(assignment);
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}

};

/* ================= CREATE ASSIGNMENT ================= */

export const createAssignment = async (req, res) => {

try {

```
const { title, description, course, dueDate, maxMarks } = req.body;

if (!title || !course || !dueDate) {
  return res.status(400).json({
    error: "Title, course and due date required",
  });
}

const assignment = await Assignment.create({

  title: title.trim(),
  description: description?.trim() || "",
  course,
  dueDate,
  maxMarks: maxMarks || 100,
  instructor: req.user._id,

});

res.status(201).json(assignment);
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}

};

/* ================= UPDATE ASSIGNMENT ================= */

export const updateAssignment = async (req, res) => {

try {

```
const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid assignment ID" });
}

const updated = await Assignment.findByIdAndUpdate(
  id,
  req.body,
  {
    new: true,
    runValidators: true,
  }
);

if (!updated) {
  return res.status(404).json({ error: "Assignment not found" });
}

res.json(updated);
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}

};

/* ================= DELETE ASSIGNMENT ================= */

export const deleteAssignment = async (req, res) => {

try {

```
const { id } = req.params;

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid assignment ID" });
}

const deleted = await Assignment.findByIdAndDelete(id);

if (!deleted) {
  return res.status(404).json({ error: "Assignment not found" });
}

res.json({ message: "Assignment deleted successfully" });
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}

};
