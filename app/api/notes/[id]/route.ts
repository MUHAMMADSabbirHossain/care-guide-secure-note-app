import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Note from "@/database/note.model";
import User from "@/database/user.model";
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ✅ Wait for params (Next.js 15+ requires await)
    const { id } = await params;

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

    // 3️⃣ Check role (Only user or admin can view notes)
    if (decoded.role !== "user" && decoded.role !== "admin") {
      return NextResponse.json(
        {
          message:
            "Access denied. You don't have permission to view this note.",
        },
        { status: 403 },
      );
    }

    // 4️⃣ Validate note ID
    if (!id) {
      return NextResponse.json(
        { message: "Note ID is required." },
        { status: 400 },
      );
    }

    // 5️⃣ Connect to database
    await connectDB();

    // 6️⃣ Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 7️⃣ Find the note
    const note = await Note.findById(id).lean();

    if (!note) {
      return NextResponse.json({ message: "Note not found." }, { status: 404 });
    }

    // 8️⃣ Authorization: Check if note belongs to the user OR user is admin
    if (note.userId.toString() !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized to view this note." },
        { status: 403 },
      );
    }

    // 9️⃣ Return the note
    return NextResponse.json(
      {
        message: "Note fetched successfully",
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          userEmail: note.userEmail,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch note error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}

// ✅ DELETE method (new)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ✅ Wait for params (Next.js 15+ requires await)
    const { id } = await params;

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

    // 3️⃣ Check role (Only user or admin can delete notes)
    if (decoded.role !== "user" && decoded.role !== "admin") {
      return NextResponse.json(
        {
          message: "Access denied. You don't have permission to delete notes.",
        },
        { status: 403 },
      );
    }

    // 4️⃣ Validate note ID
    if (!id) {
      return NextResponse.json(
        { message: "Note ID is required." },
        { status: 400 },
      );
    }

    // 5️⃣ Connect to database
    await connectDB();

    // 6️⃣ Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 7️⃣ Find the note
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json({ message: "Note not found." }, { status: 404 });
    }

    // 8️⃣ Authorization: Check if note belongs to the user OR user is admin
    if (note.userId.toString() !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized to delete this note." },
        { status: 403 },
      );
    }

    // 9️⃣ Delete the note
    await Note.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Note deleted successfully",
        deletedNote: {
          id: note._id,
          title: note.title,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    // 3️⃣ Check role
    if (decoded.role !== "user" && decoded.role !== "admin") {
      return NextResponse.json(
        {
          message: "Access denied. You don't have permission to update notes.",
        },
        { status: 403 },
      );
    }

    // 4️⃣ Validate note ID
    if (!id) {
      return NextResponse.json(
        { message: "Note ID is required." },
        { status: 400 },
      );
    }

    // 5️⃣ Get request body
    const { title, content } = await req.json();

    // 6️⃣ Validate input
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

    // 7️⃣ Connect to database
    await connectDB();

    // 8️⃣ Get user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 9️⃣ Find the note
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json({ message: "Note not found." }, { status: 404 });
    }

    // 🔟 Authorization: Check if note belongs to user OR user is admin
    if (note.userId.toString() !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized to update this note." },
        { status: 403 },
      );
    }

    // 1️⃣1️⃣ Update the note
    note.title = title;
    note.content = content;
    await note.save();

    return NextResponse.json(
      {
        message: "Note updated successfully",
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          userEmail: note.userEmail,
          updatedAt: note.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
