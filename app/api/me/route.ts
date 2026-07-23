// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(authUser.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "User fetched successfully",
        user: {
          id: user._id,
          email: user.email,
          role: user.role, // 👈 Include role
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
