// components/DeleteNoteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteNoteButtonProps {
  noteId: string;
  noteTitle: string;
  onDelete?: () => void; // Optional callback
}

export default function DeleteNoteButton({
  noteId,
  noteTitle,
  onDelete,
}: DeleteNoteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 403) {
        setError("You don't have permission to delete this note.");
        return;
      }

      if (res.status === 404) {
        setError("Note not found.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete note");
      }

      // ✅ Success - redirect to notes list
      if (onDelete) {
        onDelete();
      } else {
        router.push("/dashboard/notes");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDeleting}
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
        {isDeleting ? "Deleting..." : "Delete Note"}
      </button>

      {/* Error Message */}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

      {/* ✅ Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-black">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Note?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{noteTitle}"</strong>?
              This action cannot be undone.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setError("");
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
