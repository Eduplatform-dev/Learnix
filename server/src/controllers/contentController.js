import fs from "node:fs";
import Content from "../models/Content.js";
import { env } from "../config/env.js";

/* ================= GET ALL ================= */

export const getContent = async (req, res) => {

try {

const items = await Content
.find()
.sort({ createdAt: -1 });

res.json(items);

} catch (err) {

res.status(500).json({ error: err.message });

}

};


/* ================= GET COURSE CONTENT ================= */

export const getCourseContent = async (req, res) => {

try {

const items = await Content
.find({ course: req.params.courseId })
.sort({ createdAt: -1 });

res.json(items);

} catch (err) {

res.status(500).json({ error: err.message });

}

};


/* ================= GET CONTENT BY ID ================= */

export const getContentById = async (req, res) => {

try {

const item = await Content.findById(req.params.id);

if (!item) {
  return res.status(404).json({ error: "Content not found" });
}

res.json(item);

} catch (err) {

res.status(500).json({ error: err.message });

}

};


/* ================= CREATE CONTENT ================= */

export const createContent = async (req, res) => {

try {

const title = String(req.body?.title || "").trim();
const type = String(req.body?.type || "");
const course = req.body?.course || null;
const folder = req.body?.folder || null;

if (!title || !type || !req.file) {

  if (req.file?.path) {
    try {
      fs.unlinkSync(req.file.path);
    } catch {}
  }

  return res.status(400).json({
    error: "Title, type and file required",
  });

}

const baseUrl =
env.PUBLIC_BASE_URL ||
`${req.protocol}://${req.get("host")}`;

const url = `${baseUrl}/uploads/${req.file.filename}`;

const created = await Content.create({

  title,
  type,
  url,
  course,
  folder,
  uploadedBy: req.user._id,
  filePath: req.file.path,

});

res.status(201).json(created);

} catch (err) {

res.status(500).json({ error: err.message });

}

};


/* ================= UPDATE CONTENT ================= */

export const updateContent = async (req, res) => {

try {

const item = await Content.findById(req.params.id);

if (!item) {
  return res.status(404).json({ error: "Content not found" });
}

if (req.body?.title !== undefined) {
  item.title = req.body.title.trim();
}

if (req.body?.course !== undefined) {
  item.course = req.body.course || null;
}

if (req.body?.folder !== undefined) {
  item.folder = req.body.folder || null;
}

await item.save();

res.json(item);

} catch (err) {

res.status(500).json({ error: err.message });

}

};


/* ================= DELETE CONTENT ================= */

export const deleteContent = async (req, res) => {

try {

const item = await Content.findById(req.params.id);

if (!item) {
  return res.status(404).json({ error: "Content not found" });
}

const filePath = item.filePath;

await item.deleteOne();

if (filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch {}
}

res.json({ ok: true });

} catch (err) {

res.status(500).json({ error: err.message });

}

};