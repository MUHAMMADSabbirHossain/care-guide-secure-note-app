import React from "react";
import LogoutBtn from "./LogoutBtn";
import Link from "next/link";

const Navbar = () => {
  return (
    <section className="space-y-4">
      <div>
        <h2>Auth</h2>
        <div className="border border-white rounded-lg flex flex-wrap gap-4 p-2">
          <Link
            href="/login"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Register
          </Link>

          <LogoutBtn />
        </div>
      </div>

      <div>
        <h2>Regular User</h2>
        <div className="border border-white rounded-lg flex flex-wrap gap-4 p-2">
          <Link
            href="/dashboard"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/notes"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            User Notes
          </Link>

          <Link
            href="/dashboard/notes/create"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Create Note
          </Link>
        </div>
      </div>

      <div>
        <h2>Admin User</h2>
        <div className="border border-white rounded-lg flex flex-wrap gap-4 p-2">
          <Link
            href="/admin"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Admin Panel
          </Link>

          <Link
            href="/admin/notes"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Admin Notes
          </Link>

          <Link
            href="/dashboard/notes/create"
            className="mt-4 bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
          >
            Create Note
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
