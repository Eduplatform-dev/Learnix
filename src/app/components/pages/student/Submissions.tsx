import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Upload, File, X, Save, Send } from "lucide-react";
import { useState } from "react";

export function Submissions() {

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  /* ================= FILE UPLOAD ================= */

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  /* ================= REMOVE FILE ================= */

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= FORMAT SIZE ================= */

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Assignment Info */}

      <Card>
        <CardContent className="p-6">

          <div className="flex justify-between mb-4">

            <div>
              <h2 className="text-xl font-semibold mb-2">
                Build a Todo App with React
              </h2>

              <p className="text-gray-600">
                Advanced React Development
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-semibold">Dec 14, 2025</p>
            </div>

          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Please submit before deadline.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Submission Form */}

      <Card>
        <CardContent className="p-6">

          <h3 className="font-semibold mb-6">Submit Your Work</h3>

          <div className="space-y-6">

            {/* Title */}

            <div className="space-y-2">

              <Label htmlFor="title">Document Title</Label>

              <Input
                id="title"
                placeholder="React Todo App - Final Version"
              />

            </div>

            {/* Description */}

            <div className="space-y-2">

              <Label>Description</Label>

              <Textarea
                placeholder="Describe your submission..."
                rows={4}
              />

            </div>

            {/* File Upload */}

            <div className="space-y-3">

              <Label>Upload Files</Label>

              <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center">

                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />

                <label htmlFor="file-upload" className="cursor-pointer">

                  <div className="flex flex-col items-center gap-3">

                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Upload className="text-indigo-600" />
                    </div>

                    <p className="font-medium">
                      Click to upload files
                    </p>

                  </div>

                </label>

              </div>

              {/* Uploaded Files */}

              {uploadedFiles.length > 0 && (

                <div className="space-y-2">

                  <p className="text-sm font-medium">
                    Uploaded Files
                  </p>

                  {uploadedFiles.map((file, index) => (

                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <File className="text-indigo-600" />
                        </div>

                        <div>

                          <p className="text-sm font-medium">
                            {file.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatSize(file.size)}
                          </p>

                        </div>

                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X />
                      </Button>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Actions */}

            <div className="flex gap-3 pt-4 border-t">

              <Button className="flex-1 gap-2">
                <Send size={16} />
                Submit Assignment
              </Button>

              <Button variant="outline" className="gap-2">
                <Save size={16} />
                Save Draft
              </Button>

            </div>

          </div>

        </CardContent>
      </Card>

      {/* Previous Submissions */}

      <Card>

        <CardContent className="p-6">

          <h3 className="font-semibold mb-4">
            Previous Submissions
          </h3>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between">

            <div className="flex gap-3">

              <File className="text-green-600" />

              <div>

                <p className="text-sm font-medium">
                  React Todo App - Draft 1
                </p>

                <p className="text-xs text-gray-500">
                  Submitted on Dec 10, 2025
                </p>

              </div>

            </div>

            <span className="text-green-600 font-medium">
              85 / 100
            </span>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}