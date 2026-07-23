// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const publicRoutes = ["/login", "/register", "/"];
const protectedRoutes = ["/dashboard", "/profile", "/settings"];
const adminRoutes = ["/admin"];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public routes
  const isPublic = publicRoutes.some((route) => path === route);
  if (isPublic) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Verify token
  const decoded = verifyToken(token);
  console.log({ decoded });

  if (!decoded) {
    // Token is invalid or expired → clear cookie and redirect
    const response = NextResponse.redirect(new URL("/login", req.url));

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  // ✅ Check admin routes
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  if (isAdminRoute && decoded.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ Check protected routes
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  if (isProtected) {
    // Already authenticated, proceed
  }

  // Add user role to headers for server components
  const response = NextResponse.next();
  response.headers.set("x-user-role", decoded.role);
  response.headers.set("x-user-id", decoded.userId);

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
