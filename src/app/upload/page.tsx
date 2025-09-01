"use client";

import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-50">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Upload Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">
            📂 Upload a Document
          </h2>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-black border border-gray-300 rounded-lg cursor-pointer focus:outline-none p-2 mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`px-5 py-2 rounded-lg text-white font-medium ${
              loading || !file
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Upload & Summarize"}
          </button>
        </div>

        {/* AI Summary Section */}
        {result && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">
              🤖 Genarated Summary
            </h3>
            <div className="h-[400px] overflow-y-auto border border-gray-300 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 text-black">
              {result.summary}
            </div>
            <div className="mt-4 text-sm text-black">
              <p>
                <strong>Word Count:</strong> {result.wordCount}
              </p>
              <p>
                <strong>File:</strong> {result.fileName} ({result.fileType})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
