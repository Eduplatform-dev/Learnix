// src/app/components/pages/student/Videos.tsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Play, VideoOff } from "lucide-react";
import { getContents, type Content } from "../../../services/contentService";

export function Videos() {
  const [videos, setVideos] = useState<Content[]>([]);
  const [current, setCurrent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getContents();
        const onlyVideos = data.filter((c) => c.type === "video");
        setVideos(onlyVideos);
        setCurrent(onlyVideos[0] ?? null);
      } catch (err) {
        console.error("Failed to load videos:", err);
        setError("Unable to load videos. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading videos...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <VideoOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="p-6 text-center">
        <VideoOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          No videos available yet. Check back later or ask your instructor to upload content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* VIDEO PLAYER */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="aspect-video bg-black/95">
            <video
              key={current._id}
              src={current.url}
              controls
              className="w-full h-full object-contain"
            />
          </div>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{current.title}</h2>
                <p className="text-gray-600">
                  Watch this lesson carefully before moving to the next one.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={current.url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={current.url} download>
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PLAYLIST */}
      <div>
        <Card className="h-full border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Video Library</h3>
              <p className="text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {videos.map((v, index) => {
                const isActive = v._id === current._id;
                return (
                  <div
                    key={v._id}
                    onClick={() => setCurrent(v)}
                    className={`p-4 cursor-pointer border-b transition ${
                      isActive
                        ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? "bg-indigo-100" : "bg-gray-100"
                        }`}
                      >
                        <Play
                          className={`w-5 h-5 ${
                            isActive ? "text-indigo-600" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isActive ? "text-indigo-600" : "text-gray-900"
                          }`}
                        >
                          {v.title}
                        </p>
                        <p className="text-xs text-gray-500">Lesson {index + 1}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
