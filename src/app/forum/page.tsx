"use client";
import { useEffect, useState } from "react";

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

export default function ReviewerFeed({ role, userId, userName }: { role: string; userId: string; userName: string; }) {
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
    setFeed(feed.map((doc) =>
      doc.id === docId ? { ...doc, comments: [...doc.comments, data.comment] } : doc
    ));
    setNewComments({ ...newComments, [docId]: "" });
  };

  const handleReview = async (docId: number, status: string) => {
    await fetch("/api/documents/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, status, role }),
    });
    setFeed(feed.map((doc) =>
      doc.id === docId ? { ...doc, status } : doc
    ));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reviewer Feed</h1>
      {feed.map((doc) => (
        <div key={doc.id} className="p-4 bg-white shadow rounded-md">
          <h2 className="font-bold">{doc.title}</h2>
          <a href={doc.fileUrl} target="_blank" className="text-blue-600 underline">View File</a>
          <p className="mt-2 text-gray-800">{doc.summary || "No summary available"}</p>
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
                <span className={`px-3 py-1 rounded-md ${
                  doc.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
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
                <li key={c.id}><b>{c.userName}:</b> {c.content}</li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 border rounded-md px-2 py-1"
                value={newComments[doc.id] || ""}
                onChange={(e) => setNewComments({ ...newComments, [doc.id]: e.target.value })}
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
  );
}
