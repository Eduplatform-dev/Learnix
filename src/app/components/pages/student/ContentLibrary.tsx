import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { FileText, Image as ImageIcon, FolderOpen } from "lucide-react";
import { getContents, type Content, type ContentType } from "../../../services/contentService";
import { ImageWithFallback } from "../ImageWithFallback";

/* =========================
   TYPES
========================= */

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

  useEffect(() => {
    const load = async () => {
      try {
        const data: Content[] = await getContents();

        const filtered: ContentItem[] = data
          .filter((c) => c.type === "pdf" || c.type === "image")
          .map((c) => ({
            id: c._id,
            title: c.title,
            type: c.type,
            url: c.url,
          }));

        setItems(filtered);
      } catch (err) {
        console.error("Failed to load content:", err);
        setLoadError("Unable to load content.");
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

      <div>
        <h1 className="text-2xl font-semibold">Learning Resources</h1>
        <p className="text-gray-600">
          Documents and study materials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card
          onClick={() => setActiveCategory("pdf")}
          className="cursor-pointer border border-gray-200"
        >
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto mb-3 text-indigo-600" />
            <p className="text-xl font-bold">{pdfs.length}</p>
            <p className="text-sm text-gray-600">Documents</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveCategory("image")}
          className="cursor-pointer border border-gray-200"
        >
          <CardContent className="p-6 text-center">
            <ImageIcon className="mx-auto mb-3 text-amber-600" />
            <p className="text-xl font-bold">{images.length}</p>
            <p className="text-sm text-gray-600">Images</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 opacity-60">
          <CardContent className="p-6 text-center">
            <FolderOpen className="mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-600">Folders (Soon)</p>
          </CardContent>
        </Card>

      </div>

      {activeCategory && (
        <div className="space-y-4">

          <h2 className="text-xl font-semibold capitalize">
            {activeCategory === "pdf" ? "Documents" : "Images"}
          </h2>

          {items
            .filter((i) => i.type === activeCategory)
            .map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-4">

                  <div className="flex justify-between">
                    <p className="font-medium">{item.title}</p>

                    <Button asChild size="sm">
                      <a href={item.url} target="_blank">
                        Open
                      </a>
                    </Button>
                  </div>

                  {item.type === "pdf" && (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(
                        item.url
                      )}&embedded=true`}
                      className="w-full h-[500px]"
                    />
                  )}

                  {item.type === "image" && (
                    <ImageWithFallback
                      src={item.url}
                      alt={item.title}
                      className="w-full max-w-md rounded"
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