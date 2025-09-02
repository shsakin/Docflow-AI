"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [summaries, setSummaries] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(""); // ✅ toast message

  const [currentIndex, setCurrentIndex] = useState(0);

  const summaryKeys = ["short", "medium", "long", "keyPoints"];
  const summaryLabels: Record<string, string> = {
    short: "Short Summary",
    medium: "Medium Summary",
    long: "Long Summary",
    keyPoints: "Key Points",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSummaries(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Upload failed");
        return;
      }

      const data = await res.json();
      setSummaries(data.summaries);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? summaryKeys.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === summaryKeys.length - 1 ? 0 : prev + 1
    );
  };

  const handleCopy = async () => {
    if (summaries) {
      const key = summaryKeys[currentIndex];
      const text = summaries[key] || "";
      if (text) {
        await navigator.clipboard.writeText(text);
        showToast("✅ Summary copied!");
      }
    }
  };

  // ✅ Toast handler
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000); // disappear after 2s
  };

  return (
    <main className="flex flex-col items-center p-50 bg-gray-50 min-h-screen text-black relative">
      <h1 className="text-2xl font-bold mb-4">Upload your doccument</h1>

      <input
        type="file"
        onChange={handleFileChange}
        className="cursor-pointer focus:outline-none mb-4 border p-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 cursor-pointer focus:outline-none"
      >
        {loading ? "Processing..." : "Upload & Summarize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {summaries && (
        <div className="mt-6 w-full max-w-2xl border p-4 rounded bg-white shadow">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrev}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              ◀
            </button>
            <h2 className="font-semibold text-lg">
              {summaryLabels[summaryKeys[currentIndex]]}
            </h2>
            <button
              onClick={handleNext}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              ▶
            </button>
          </div>

          <p className="whitespace-pre-wrap mb-4">
            {summaries[summaryKeys[currentIndex]] || "No summary available"}
          </p>

          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer focus:outline-none"
          >
            Copy Text
          </button>
        </div>
      )}

      {/* ✅ Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}
    </main>
  );
}
