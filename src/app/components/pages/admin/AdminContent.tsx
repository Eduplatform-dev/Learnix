import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Upload, X } from "lucide-react";

import {
  createContent,
  deleteContent,
  getContents,
} from "../../../services/contentService";

import { ImageWithFallback } from "../ImageWithFallback";

/* ================= TYPES ================= */
type ContentType = "video" | "pdf" | "image";

type ContentItem = {
  id: string;
  title: string;
  type: ContentType;
  url: string;
};

/* ================= COMPONENT ================= */
export function AdminContent() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [activeType, setActiveType] = useState<ContentType | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("video");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  /* ================= LOAD ================= */
  const loadContents = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getContents();

      setContents(
        (data || []).map((i: any) => ({
          id: i._id,
          title: i.title,
          type: i.type,
          url: i.url,
        }))
      );
    } catch (e) {
      console.error("Load content failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Title + file required");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("file", file);

      await createContent(formData);

      // reset state
      setTitle("");
      setFile(null);
      setShowUpload(false);
      setActiveType(null);

      if (fileRef.current) fileRef.current.value = "";

      await loadContents();
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;

    try {
      setDeletingId(item.id);
      await deleteContent(item.id);

      // optimistic update
      setContents((prev) => prev.filter((c) => c.id !== item.id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Content Library</h1>
          <p className="text-gray-500">Manage files</p>
        </div>

        <Button onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* UPLOAD PANEL */}
      {showUpload && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <h3 className="font-semibold">Upload</h3>
              <Button variant="ghost" onClick={() => setShowUpload(false)}>
                <X />
              </Button>
            </div>

            <input
              className="border p-2 w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              className="border p-2 w-full"
              value={type}
              onChange={(e) => setType(e.target.value as ContentType)}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>

            <input
              ref={fileRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {error && <p className="text-red-500">{error}</p>}

            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CATEGORY */}
      <div className="flex gap-3">
        <Button onClick={() => setActiveType("video")}>Videos</Button>
        <Button onClick={() => setActiveType("pdf")}>Docs</Button>
        <Button onClick={() => setActiveType("image")}>Images</Button>
      </div>

      {/* LIST */}
      {activeType && (
        <div className="space-y-4">
          {contents
            .filter((c) => c.type === activeType)
            .map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-xs">{c.type}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <a href={c.url} target="_blank">
                          Open
                        </a>
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(c)}
                      >
                        {deletingId === c.id ? "..." : "Delete"}
                      </Button>
                    </div>
                  </div>

                  {c.type === "video" && (
                    <video src={c.url} controls className="w-full rounded" />
                  )}

                  {c.type === "image" && (
                    <ImageWithFallback
                      src={c.url}
                      alt={c.title}
                      className="max-w-md"
                    />
                  )}

                  {c.type === "pdf" && (
                    <iframe src={c.url} className="w-full h-[500px]" />
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}