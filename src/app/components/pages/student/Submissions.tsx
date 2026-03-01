import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Upload, File, X, Save, Send } from 'lucide-react';
import { useState } from 'react';

export function Submissions() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles([...uploadedFiles, ...fileNames]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Info */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Build a Todo App with React
              </h2>
              <p className="text-gray-600">Advanced React Development</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-semibold text-gray-900">Dec 14, 2025</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Please submit your assignment before the deadline. Late
              submissions will incur a 10% penalty per day.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Submit Your Work</h3>

          <div className="space-y-6">
            {/* Document Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="e.g., React Todo App - Final Version"
                className="bg-white border-gray-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a brief description of your submission..."
                rows={4}
                className="bg-white border-gray-200 resize-none"
              />
            </div>

            {/* Text Editor Toolbar */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="font-bold">B</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="italic">I</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="underline">U</span>
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  Link
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  Code
                </Button>
              </div>
              <Textarea
                placeholder="Type your submission content here..."
                rows={8}
                className="border-0 rounded-none resize-none focus-visible:ring-0"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label>Upload Files</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
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
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: PDF, DOC, DOCX, ZIP (Max 50MB)
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <File className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file}</p>
                          <p className="text-xs text-gray-500">2.4 MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Button className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Submit Assignment
              </Button>
              <Button variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Previous Submissions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <File className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">React Todo App - Draft 1</p>
                  <p className="text-xs text-gray-500">Submitted on Dec 10, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">Graded: 85/100</span>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
