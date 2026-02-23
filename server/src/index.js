import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "./config.js";
import { admin, auth, db } from "./firebaseAdmin.js";
import { cloudinary } from "./cloudinaryClient.js";

const app = express();

app.use(helmet());
app.use(morgan("tiny"));
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const deleteSchema = z.object({
  contentId: z.string().min(1),
});

const folderCreateSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

const folderDeleteSchema = z.object({
  folderId: z.string().min(1),
});

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
};

const requireAuth = async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Missing auth token." });
    return null;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const userData = userSnap.exists ? userSnap.data() : null;

    return {
      uid: decoded.uid,
      email: decoded.email || userData?.email || null,
      role: userData?.role === "admin" ? "admin" : "user",
    };
  } catch {
    res.status(401).json({ error: "Invalid auth token." });
    return null;
  }
};

const requireAdmin = async (req, res) => {
  const authCtx = await requireAuth(req, res);
  if (!authCtx) return null;

  if (authCtx.role !== "admin") {
    res.status(403).json({ error: "Admin access required." });
    return null;
  }

  return authCtx;
};

const normalizeResourceType = (resourceType, contentType) => {
  const rt = String(resourceType || "").toLowerCase();
  if (rt === "image" || rt === "video" || rt === "raw") return rt;

  if (contentType === "video") return "video";
  if (contentType === "pdf") return "raw";
  return "image";
};

app.post("/api/content/delete", async (req, res) => {
  try {
    const authCtx = await requireAdmin(req, res);
    if (!authCtx) return;

    const { contentId } = deleteSchema.parse(req.body);
    const contentRef = db.collection("contents").doc(contentId);
    const contentSnap = await contentRef.get();

    if (!contentSnap.exists) {
      return res.status(404).json({ error: "Content not found." });
    }

    const content = contentSnap.data();
    const publicId = content?.publicId;
    const resourceType = normalizeResourceType(
      content?.resourceType,
      content?.type
    );

    let cloudinaryResult = null;
    let cloudinaryError = null;

    if (publicId) {
      try {
        cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        });
      } catch (err) {
        cloudinaryError =
          err instanceof Error ? err.message : "Cloudinary delete failed.";
      }
    }

    await contentRef.delete();

    await db.collection("audit_logs").add({
      action: "content_delete",
      contentId,
      contentTitle: content?.title ?? null,
      contentType: content?.type ?? null,
      folderId: content?.folderId ?? null,
      publicId: publicId ?? null,
      resourceType: resourceType ?? null,
      cloudinaryResult,
      cloudinaryError,
      userId: authCtx.uid,
      userEmail: authCtx.email,
      ip: req.ip,
      userAgent: req.get("user-agent") || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      ok: true,
      cloudinary: cloudinaryResult,
      cloudinaryError,
      deletedId: contentId,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Delete failed:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/folders", async (req, res) => {
  try {
    const authCtx = await requireAuth(req, res);
    if (!authCtx) return;

    const snap = await db
      .collection("folders")
      .orderBy("createdAt", "desc")
      .get();

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ items });
  } catch (err) {
    console.error("Failed to load folders:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/folders", async (req, res) => {
  try {
    const authCtx = await requireAdmin(req, res);
    if (!authCtx) return;

    const { name } = folderCreateSchema.parse(req.body);

    const existing = await db
      .collection("folders")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: "Folder name already exists." });
    }

    const ref = await db.collection("folders").add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authCtx.uid,
    });

    return res.status(201).json({ id: ref.id, name });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Create folder failed:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/folders/delete", async (req, res) => {
  try {
    const authCtx = await requireAdmin(req, res);
    if (!authCtx) return;

    const { folderId } = folderDeleteSchema.parse(req.body);

    const folderRef = db.collection("folders").doc(folderId);
    const folderSnap = await folderRef.get();

    if (!folderSnap.exists) {
      return res.status(404).json({ error: "Folder not found." });
    }

    const inUse = await db
      .collection("contents")
      .where("folderId", "==", folderId)
      .limit(1)
      .get();

    if (!inUse.empty) {
      return res
        .status(400)
        .json({ error: "Folder not empty. Move or delete content first." });
    }

    await folderRef.delete();

    await db.collection("audit_logs").add({
      action: "folder_delete",
      folderId,
      folderName: folderSnap.data()?.name ?? null,
      userId: authCtx.uid,
      userEmail: authCtx.email,
      ip: req.ip,
      userAgent: req.get("user-agent") || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ ok: true, folderId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Delete folder failed:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});
