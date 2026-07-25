// app/dashboard/note/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeleteNoteButton from "@/components/DeleteNoteBtn";

interface Note {
  id: string;
  title: string;
  content: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteId, setNoteId] = useState<string>("");

  // Extract note ID from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setNoteId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fetch note when ID is available
  useEffect(() => {
    if (!noteId) return;

    const fetchNote = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/notes/${noteId}`);

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (res.status === 403) {
          setError("You don't have permission to view this note.");
          return;
        }

        if (res.status === 404) {
          setError("Note not found.");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch note");
        }

        const data = await res.json();
        setNote(data.note);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, router]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Unable to load note</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/dashboard/notes"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Note not found</h2>
          <Link
            href="/dashboard/notes"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          href="/dashboard/notes"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Notes
        </Link>

        {/* Note Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
              {note.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span>By: {note.userEmail}</span>
              <span>•</span>
              <span>Created: {formatDate(note.createdAt)}</span>
              {note.updatedAt !== note.createdAt && (
                <>
                  <span>•</span>
                  <span>Updated: {formatDate(note.updatedAt)}</span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t px-6 py-4 bg-gray-50 flex flex-wrap gap-3">
            <Link
              href={`/notes/edit/${note.id}`}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit Note
            </Link>
            {/* <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this note?")) {
                  // Delete logic here
                }
              }}
              className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Note
            </button> */}

            {/* ✅ Delete Note Button */}
            <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
