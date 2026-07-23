// lib/auth.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

// Get user from request (for API routes)
export const getAuthUser = (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
};

// Check if user has required role
export const requireRole = (req: NextRequest, roles: string[]) => {
  const user = getAuthUser(req);
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
};

// For API routes - returns error response if unauthorized
export const authorize = (req: NextRequest, roles: string[]) => {
  const user = requireRole(req, roles);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { message: "Unauthorized. Insufficient permissions." },
        { status: 403 },
      ),
    };
  }
  return { authorized: true, user };
};
