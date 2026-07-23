// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { authorize } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // ✅ Only admin can access this
  const auth = authorize(req, ["admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await connectDB();

    // Get all users (admin only)
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Admin only POST endpoint
export async function POST(req: NextRequest) {
  const auth = authorize(req, ["admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  // Admin-only logic here
  return NextResponse.json({ message: "Admin action successful" });
}
