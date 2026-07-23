// app/notes/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create note");
      }

      setSuccess(true);
      setTitle("");
      setContent("");

      // Redirect to notes list after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard/notes");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create Note</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded mb-4 text-sm">
            ✅ Note created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              placeholder="Write your note content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creating..." : "Create Note"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          <a href="/notes" className="text-blue-600 hover:underline">
            ← Back to Notes
          </a>
        </p>
      </div>
    </div>
  );
}
