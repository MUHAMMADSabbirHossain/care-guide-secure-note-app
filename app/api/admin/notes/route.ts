// app/api/admin/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Note from "@/database/note.model";
import User from "@/database/user.model";
import { verifyToken } from "@/lib/jwt";

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

    // 3️⃣ ✅ Check if user is ADMIN
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Access denied. Admin only." },
        { status: 403 },
      );
    }

    // 4️⃣ Get query parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const sort = searchParams.get("sort") || "newest";
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // 5️⃣ Validate pagination
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 10;
    const skip = (validPage - 1) * validLimit;

    // 6️⃣ Connect to database
    await connectDB();

    // 7️⃣ Build sort
    let sortOptions: any = {};
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "title_asc":
        sortOptions = { title: 1 };
        break;
      case "title_desc":
        sortOptions = { title: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // 8️⃣ Build search query
    let searchFilter: any = {};
    if (query) {
      searchFilter = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
        ],
      };
    }

    // 9️⃣ 🔥 FIX: Use aggregation with $lookup to get user role
    let pipeline: any[] = [];

    // Stage 1: Match notes with search filter
    if (Object.keys(searchFilter).length > 0) {
      pipeline.push({ $match: searchFilter });
    }

    // Stage 2: Lookup user data from User collection
    pipeline.push({
      $lookup: {
        from: "users", // 👈 Collection name in MongoDB (lowercase plural)
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    });

    // Stage 3: Unwind userData (convert array to object)
    pipeline.push({
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true, // Keep notes even if user not found
      },
    });

    // Stage 4: ✅ Filter by role (user or admin)
    if (filter === "user") {
      pipeline.push({
        $match: {
          "userData.role": "user",
        },
      });
    } else if (filter === "admin") {
      pipeline.push({
        $match: {
          "userData.role": "admin",
        },
      });
    }
    // If filter === "all", no role filter

    // Stage 5: Sort
    pipeline.push({ $sort: sortOptions });

    // Stage 6: Pagination (skip + limit)
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: validLimit });

    // Stage 7: Project (clean up the output)
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        userId: 1,
        userEmail: 1,
        createdAt: 1,
        updatedAt: 1,
        userRole: "$userData.role", // 👈 Include role in response
      },
    });

    // 🔟 Execute aggregation for notes
    const notes = await Note.aggregate(pipeline);

    // 1️⃣1️⃣ Get total count (without pagination for pagination metadata)
    let countPipeline: any[] = [];

    // Add search filter to count pipeline
    if (Object.keys(searchFilter).length > 0) {
      countPipeline.push({ $match: searchFilter });
    }

    // Add lookup for counting
    countPipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    });

    countPipeline.push({
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Add role filter to count pipeline
    if (filter === "user") {
      countPipeline.push({
        $match: {
          "userData.role": "user",
        },
      });
    } else if (filter === "admin") {
      countPipeline.push({
        $match: {
          "userData.role": "admin",
        },
      });
    }

    // Count total documents
    countPipeline.push({ $count: "total" });

    const countResult = await Note.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // 1️⃣2️⃣ Return response
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
    console.error("Admin notes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
