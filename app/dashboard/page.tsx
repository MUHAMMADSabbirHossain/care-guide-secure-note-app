"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutBtn from "@/components/LogoutBtn";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome back, {user?.email}! 👋</p>
      <p className="text-sm text-gray-500 mt-1">
        Last login:{" "}
        {user?.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : "First time"}
      </p>

      <LogoutBtn />

      <div className="my-6">
        <Link
          href="/dashboard/notes/create"
          className="p-2 border-2 rounded-xl"
        >
          Create Note
        </Link>
      </div>
    </div>
  );
}
