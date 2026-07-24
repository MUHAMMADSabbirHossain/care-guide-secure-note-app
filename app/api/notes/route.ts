// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Note from "@/database/note.model";
import User from "@/database/user.model";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required. Please login." },
        { status: 401 },
      );
    }

    // 2️⃣ Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or expired token. Please login again." },
        { status: 401 },
      );
    }

    // 3️⃣ Check role (Only 'user' or 'admin' can create notes)
    if (decoded.role !== "user" && decoded.role !== "admin") {
      return NextResponse.json(
        {
          message: "Access denied. You don't have permission to create notes.",
        },
        { status: 403 },
      );
    }

    // 4️⃣ Get request body
    const { title, content } = await req.json();

    // 5️⃣ Validate input
    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required." },
        { status: 400 },
      );
    }

    if (title.length < 3) {
      return NextResponse.json(
        { message: "Title must be at least 3 characters." },
        { status: 400 },
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { message: "Content must be at least 10 characters." },
        { status: 400 },
      );
    }

    // 6️⃣ Connect to database
    await connectDB();

    // 7️⃣ Get user from database (optional extra check)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 8️⃣ Create note
    const note = await Note.create({
      title,
      content,
      userId: user._id,
      userEmail: user.email,
    });

    return NextResponse.json(
      {
        message: "Note created successfully",
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          userEmail: note.userEmail,
          createdAt: note.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    // 2️⃣ Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // 3️⃣ Check role
    if (decoded.role !== "user" && decoded.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // 4️⃣ Get query parameters from URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    // 5️⃣ Validate pagination parameters
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 10;
    const skip = (validPage - 1) * validLimit;

    // 6️⃣ Connect to database
    await connectDB();

    // 7️⃣ Build search filter
    const filter: any = { userId: decoded.userId };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }

    // 8️⃣ Execute queries
    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit)
        .lean(),
      Note.countDocuments(filter),
    ]);

    // 9️⃣ Return response with pagination metadata
    return NextResponse.json(
      {
        message: "Notes fetched successfully",
        notes,
        pagination: {
          total,
          page: validPage,
          limit: validLimit,
          totalPages: Math.ceil(total / validLimit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
