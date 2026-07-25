// app/admin/notes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Note {
  _id: string;
  title: string;
  content: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminNotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Parameters
  const query = searchParams.get("query") || "";
  const sort = searchParams.get("sort") || "newest";
  const filter = searchParams.get("filter") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedSort, setSelectedSort] = useState(sort);
  const [selectedFilter, setSelectedFilter] = useState(filter);

  // Fetch notes when URL parameters change
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError("");

      try {
        const url = `/api/admin/notes?query=${encodeURIComponent(query)}&sort=${sort}&filter=${filter}&page=${page}&limit=${limit}`;
        const res = await fetch(url);

        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await res.json();
        setNotes(data.notes || []);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [query, sort, filter, page, limit, router]);

  // Update URL with new parameters
  const updateUrl = (params: Record<string, string | number>) => {
    const urlParams = new URLSearchParams({
      query: String(params.query || ""),
      sort: String(params.sort || "newest"),
      filter: String(params.filter || "all"),
      page: String(params.page || 1),
      limit: String(params.limit || 10),
    });
    router.push(`/admin/notes?${urlParams.toString()}`);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({
      query: searchQuery,
      sort: selectedSort,
      filter: selectedFilter,
      page: 1,
      limit,
    });
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSort(e.target.value);
    updateUrl({
      query,
      sort: e.target.value,
      filter: selectedFilter,
      page: 1,
      limit,
    });
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
    updateUrl({
      query,
      sort: selectedSort,
      filter: e.target.value,
      page: 1,
      limit,
    });
  };

  // Handle limit change
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    updateUrl({
      query,
      sort: selectedSort,
      filter: selectedFilter,
      page: 1,
      limit: newLimit,
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateUrl({
      query,
      sort: selectedSort,
      filter: selectedFilter,
      page: newPage,
      limit,
    });
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Logged in as <span className="font-medium text-blue-600">Admin</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-1">
            <div className="flex">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort
            </label>
            <select
              value={selectedSort}
              onChange={handleSortChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title_asc">Title (A→Z)</option>
              <option value="title_desc">Title (Z→A)</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter
            </label>
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notes</option>
              <option value="user">Users Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show
            </label>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Notes Table */}
      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No notes found.</p>
          {query && (
            <button
              onClick={() => {
                setSearchQuery("");
                updateUrl({ query: "", sort, filter, page: 1, limit });
              }}
              className="mt-2 text-blue-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white text-black rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      <span className="font-mono text-xs">
                        {note._id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-2 font-medium">{note.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {truncateText(note.content, 80)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {note.userEmail || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/dashboard/note/${note._id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} notes
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Prev
                </button>
                <span className="px-3 py-1 bg-blue-100 rounded">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
