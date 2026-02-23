import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { FileText, Image as ImageIcon, FolderOpen } from "lucide-react";
import { getContents } from "../../../services/contentService";
import { ImageWithFallback } from "../ImageWithFallback";

/* =========================
   TYPES
========================= */
type ContentType = "pdf" | "image";

type ContentItem = {
  id: string;
  title: string;
  type: ContentType;
  url: string;
};

type Category = "pdf" | "image" | null;

/* =========================
   COMPONENT
========================= */
export function ContentLibrary() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* =========================
     LOAD CONTENT (NO VIDEOS)
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getContents();

        const filtered = data.filter(
          (c) => c.type === "pdf" || c.type === "image"
        ) as ContentItem[];

        setItems(filtered);
      } catch (err) {
        console.error("Failed to load content:", err);
        setLoadError("Unable to load content. Please check permissions.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-6">Loading content...</div>;
  }

  const pdfs = items.filter((i) => i.type === "pdf");
  const images = items.filter((i) => i.type === "image");

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Learning Resources</h1>
        <p className="text-gray-600">
          Documents, images and other study materials
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          onClick={() => setActiveCategory("pdf")}
          className={`cursor-pointer border border-gray-200 transition-all hover:shadow-md ${
            activeCategory === "pdf" ? "ring-2 ring-indigo-500" : ""
          }`}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{pdfs.length}</p>
            <p className="text-sm text-gray-600">Documents</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveCategory("image")}
          className={`cursor-pointer border border-gray-200 transition-all hover:shadow-md ${
            activeCategory === "image" ? "ring-2 ring-indigo-500" : ""
          }`}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
              <ImageIcon className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{images.length}</p>
            <p className="text-sm text-gray-600">Images</p>
          </CardContent>
        </Card>

        <Card className="cursor-not-allowed border border-gray-200 opacity-60">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
              <FolderOpen className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">Auto</p>
            <p className="text-sm text-gray-600">Folders</p>
            <p className="mt-1 text-xs text-gray-400">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          {loadError || "No content available yet."}
        </div>
      )}

      {/* CONTENT LIST */}
      {activeCategory && items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold capitalize">
            {activeCategory === "pdf" ? "Documents" : "Images"}
          </h2>

          {items
            .filter((i) => i.type === activeCategory)
            .map((item) => (
              <Card key={item.id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {item.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <a href={item.url} download>
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* PDF PREVIEW */}
                  {item.type === "pdf" && (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(
                        item.url
                      )}&embedded=true`}
                      className="w-full min-h-[420px] h-[70vh] max-h-[800px] border rounded-lg bg-white"
                      title={item.title}
                    />
                  )}

                  {/* IMAGE PREVIEW */}
                  {item.type === "image" && (
                    <ImageWithFallback
                      src={item.url}
                      alt={item.title}
                      className="w-full max-w-md rounded-lg border object-contain"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
