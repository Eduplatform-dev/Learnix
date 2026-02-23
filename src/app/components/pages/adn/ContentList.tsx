import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { ImageWithFallback } from "../ImageWithFallback";
import {
  getContents,
  deleteContent,
  updateContent,
  Content,
  ContentType,
} from "../../../services/contentService";

type Props = {
  activeType: ContentType | null;
  activeFolder?: string | null; // 🔵 NEW
};

export function ContentList({ activeType, activeFolder }: Props) {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await getContents();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (!activeType) {
    return (
      <p className="text-gray-500 text-center">
        Select a category to view content
      </p>
    );
  }

  if (loading) return <p>Loading content...</p>;

  /* filter by type + folder */
  const filtered = items.filter(
    (i) =>
      i.type === activeType &&
      (!activeFolder || i.folder === activeFolder)
  );

  if (filtered.length === 0) {
    return <p className="text-gray-500">No content available</p>;
  }

  return (
    <div className="space-y-4">
      {filtered.map((c) => (
        <Card key={c.id} className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* TITLE */}
            {editId === c.id ? (
              <div className="flex gap-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border px-2 py-1"
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    await updateContent(c.id, { title: newTitle });
                    setEditId(null);
                    load();
                  }}
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-500">
                    {c.type} • {c.folder || "general"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditId(c.id);
                      setNewTitle(c.title);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await deleteContent(c.id);
                      load();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2">
              <Button asChild size="sm">
                <a href={c.url} target="_blank">Open</a>
              </Button>
            </div>

            {/* VIDEO */}
            {c.type === "video" && (
              <video src={c.url} controls className="w-full rounded" />
            )}

            {/* IMAGE */}
            {c.type === "image" && (
              <ImageWithFallback
                src={c.url}
                alt={c.title}
                className="w-full max-w-md rounded"
              />
            )}

            {/* PDF */}
            {c.type === "pdf" && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  c.url
                )}&embedded=true`}
                className="w-full h-[500px]"
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
