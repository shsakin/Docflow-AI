"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ];

      if (!allowedTypes.includes(selected.type)) {
        setError("Only PDF, DOCX, and TXT files are allowed.");
        setFile(null);
        return;
      }

      setFile(selected);
      setError("");
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }
    // For now, just preview selected file; backend logic will be added later.
    alert(`File ready for upload: ${file.name}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Upload Document</h1>

        {/* File Selection */}
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            id="fileInput"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => document.getElementById("fileInput")?.click()}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition"
          >
            {file ? file.name : "Choose File"}
          </button>
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Upload
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        {/* Preview Selected File Info */}
        {file && !error && (
          <div className="mt-4 p-3 border rounded bg-gray-100">
            <p className="text-gray-700">
              <strong>File:</strong> {file.name}
            </p>
            <p className="text-gray-700">
              <strong>Type:</strong> {file.type || "Unknown"}
            </p>
            <p className="text-gray-700">
              <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
