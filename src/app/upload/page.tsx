"use client";

import { useState } from "react";
import { useSession } from "next-auth/react"; // ✅ for sign-in check

export default function Home() {
  const { data: session } = useSession(); // ✅ user session
  const [file, setFile] = useState<File | null>(null);
  const [summaries, setSummaries] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // ✅ file url
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // ✅ progress state
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const summaryKeys = ["short", "detailed"];
  const summaryLabels: Record<string, string> = {
    short: "Short Summary",
    detailed: "Detailed Summary",
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
    setUploadProgress(0); // ✅ reset progress

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // ✅ Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // ✅ Handle response
      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
            });
            resolve(response);
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Request timeout'));
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || "Upload failed");
        return;
      }

      const data = await response.json();
      setSummaries(data.summaries);
      setFileUrl(data.fileUrl || null); // ✅ get fileUrl
      setFileName(data.fileName || null);
      setCurrentIndex(0);
      setUploadProgress(100); // ✅ complete
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setUploadProgress(0); // ✅ reset on error
    } finally {
      setLoading(false);
      // ✅ Hide progress bar after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
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

  // ✅ Export as PDF
  const handleExportPDF = async () => {
    if (!summaries) return;

    const key = summaryKeys[currentIndex];
    const summaryText = summaries[key];
    const summaryType = summaryLabels[key];

    try {
      // Create PDF content
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up PDF styling
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Document Summary", 20, 30);
      
      // Add file name if available
      if (fileName) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`File: ${fileName}`, 20, 45);
      }
      
      // Add summary type
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${summaryType}:`, 20, fileName ? 65 : 55);
      
      // Add summary content with text wrapping
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      const startY = fileName ? 80 : 70;
      const pageWidth = doc.internal.pageSize.width;
      const margins = 20;
      const textWidth = pageWidth - (margins * 2);
      
      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(summaryText, textWidth);
      
      // Add text with automatic page breaks
      doc.text(lines, margins, startY);
      
      // Add footer with timestamp
      const pageCount = doc.getNumberOfPages(); // ✅ Fixed method call
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Generated by DocFlowAI on ${new Date().toLocaleDateString()}`,
          margins,
          doc.internal.pageSize.height - 20
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margins - 30,
          doc.internal.pageSize.height - 20
        );
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = fileName 
        ? `${fileName.replace(/\.[^/.]+$/, "")}_${summaryType.toLowerCase()}_${timestamp}.pdf`
        : `summary_${summaryType.toLowerCase()}_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      showToast("✅ PDF exported successfully!");
      
    } catch (err) {
      console.error("PDF export error:", err);
      showToast("❌ Failed to export PDF");
    }
  };
  const handleShare = async () => {
    if (!session || !session.user) {
      showToast("⚠️ Please sign in to share");
      return;
    }

    const key = summaryKeys[currentIndex];
    const text = summaries[key];
    console.log(session)
    try {
      const res = await fetch("/api/doccuments/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fileName || "Untitled Document",
          fileUrl,
          summary: text,
          uploaderId: session.user.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to share");
      }

      showToast("✅ Shared to forum!");
      window.location.href = "/forum";
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to share");
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
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

      {/* ✅ Progress Bar */}
      {loading && uploadProgress > 0 && (
        <div className="mt-4 w-full max-w-md">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

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

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer focus:outline-none"
            >
              Copy Text
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer focus:outline-none"
            >
              Share this version to forum
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-purple-600 text-white rounded cursor-pointer focus:outline-none"
            >
              Export PDF
            </button>
          </div>
        </div>
      )}
      
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}
    </main>
  );
}