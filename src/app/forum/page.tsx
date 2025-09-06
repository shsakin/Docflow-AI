"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  id: number;
  userName: string;
  content: string;
  createdAt: string;
}

interface Document {
  id: number;
  title: string;
  fileUrl: string;
  status: string;
  summary: string;
  uploaderId: string;
  comments: Comment[];
}

export default function ReviewerFeed(){
  const {data: session} = useSession();
  const role = session?.user?.role ?? "uploader";
  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name ?? "Anonymous";

  const [feed, setFeed] = useState<Document[]>([]);
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch("/api/forum")
      .then((res) => res.json())
      .then((data) => setFeed(data.feed));
  }, []);

  const handleComment = async (docId: number) => {
    const content = newComments[docId];
    if (!content) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: docId, userId, userName, content }),
    });

    const data = await res.json();
    setFeed(
      feed.map((doc) =>
        doc.id === docId
          ? { ...doc, comments: [...doc.comments, data.comment] }
          : doc
      )
    );
    setNewComments({ ...newComments, [docId]: "" });
  };

  const handleReview = async (docId: number, status: string) => {
    await fetch("/api/doccuments/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, status, role }),
    });
    setFeed(feed.map((doc) => (doc.id === docId ? { ...doc, status } : doc)));
  };

  // Export PDF function for forum documents
  const handleExportPDF = async (doc: Document) => {
    try {
      
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Forum Document Summary", 20, 30);
      
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Title: ${doc.title}`, 20, 50);
      
     
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Status: ${doc.status}`, 20, 65);
      
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary:", 20, 85);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      const pageWidth = pdf.internal.pageSize.width;
      const margins = 20;
      const textWidth = pageWidth - (margins * 2);
      
      // Split summary text into lines that fit the page width
      const summaryLines = pdf.splitTextToSize(doc.summary || "No summary available", textWidth);
      pdf.text(summaryLines, margins, 100);
      
      // Calculate position for comments section
      const summaryHeight = summaryLines.length * 6; // Approximate line height
      let commentsStartY = 100 + summaryHeight + 20;
      
      // Add comments section if there are comments
      if (doc.comments && doc.comments.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Comments:", 20, commentsStartY);
        
        commentsStartY += 15;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        doc.comments.forEach((comment, index) => {
          const commentText = `${comment.userName}: ${comment.content}`;
          const commentLines = pdf.splitTextToSize(commentText, textWidth);
          
          // Check if we need a new page
          if (commentsStartY + (commentLines.length * 5) > pdf.internal.pageSize.height - 30) {
            pdf.addPage();
            commentsStartY = 30;
          }
          
          pdf.text(commentLines, margins, commentsStartY);
          commentsStartY += commentLines.length * 5 + 5; // Add spacing between comments
        });
      }
      
      // Add footer with timestamp
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Generated from DocFlowAI Forum on ${new Date().toLocaleDateString()}`,
          margins,
          pdf.internal.pageSize.height - 20
        );
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margins - 30,
          pdf.internal.pageSize.height - 20
        );
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_forum_${timestamp}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF");
    }
  };

  return (
    <main className="bg-white text-black min-h-screen">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-center text-2xl font-bold pt-12">Welcome to the Forum</h1>
        {feed.map((doc) => (
          <div key={doc.id} className="p-4 bg-white shadow rounded-md">
            <h2 className="font-bold">{doc.title}</h2>
            <a
              href={doc.fileUrl}
              target="_blank"
              className="text-blue-600 underline"
            >
              View File
            </a>
            <p className="mt-2 text-gray-800">
              {doc.summary || "No summary available"}
            </p>
            <p className="text-sm text-gray-500">Status: {doc.status}</p>

            {/* Approve/Reject only for reviewers/admins */}
            {role === "admin" || role === "reviewer" ? (
              <div className="flex gap-2 mt-2">
                {doc.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleReview(doc.id, "approved")}
                      className="px-3 py-1 bg-green-600 text-white rounded-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(doc.id, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white rounded-md"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-md ${
                      doc.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                )}
              </div>
            ) : null}

            {/* Comments */}
            <div className="mt-4">
              <h3 className="font-semibold">Comments</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {doc.comments.map((c) => (
                  <li key={c.id}>
                    <b>{c.userName}:</b> {c.content}
                  </li>
                ))}
              </ul>
                <button
                  onClick={() => handleExportPDF(doc)}
                  className="ml-145 px-3 py-1 bg-purple-600 text-white rounded-md"
                >
                  Export PDF
                </button>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 border rounded-md px-2 py-1"
                  value={newComments[doc.id] || ""}
                  onChange={(e) =>
                    setNewComments({
                      ...newComments,
                      [doc.id]: e.target.value,
                    })
                  }
                />
                <button
                  onClick={() => handleComment(doc.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}