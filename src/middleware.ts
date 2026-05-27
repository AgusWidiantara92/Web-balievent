import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Role-to-path mapping for dashboard routes.
 * Each role is only allowed to access its own sub-dashboard path.
 */
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  ORGANIZER: "/dashboard/organizer",
  USER: "/dashboard/user",
};

/**
 * Protected route prefixes that require authentication.
 * Any path starting with these will trigger the auth check in middleware.
 */
const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Auth-only pages: logged-in users should NOT see these.
 * Redirect them to /dashboard instead.
 */
const AUTH_PAGES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;

  // ─────────────────────────────────────────────────
  // 1. Redirect logged-in users away from login/register
  // ─────────────────────────────────────────────────
  if (isLoggedIn && AUTH_PAGES.some((page) => pathname.startsWith(page))) {
    const dashboardPath = userRole
      ? ROLE_DASHBOARD_MAP[userRole] || "/dashboard/user"
      : "/dashboard";
    return NextResponse.redirect(new URL(dashboardPath, nextUrl));
  }

  // ─────────────────────────────────────────────────
  // 2. Protect /dashboard/* routes — require login
  // ─────────────────────────────────────────────────
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─────────────────────────────────────────────────
  // 3. Enforce role-based access on specific dashboard sub-paths
  // ─────────────────────────────────────────────────
  if (isProtectedRoute && isLoggedIn && userRole) {
    // Skip the base /dashboard route (it's the role router itself)
    if (pathname === "/dashboard") {
      return NextResponse.next();
    }

    // Check if user is trying to access a dashboard that doesn't match their role
    const allowedPath = ROLE_DASHBOARD_MAP[userRole];
    if (allowedPath && !pathname.startsWith(allowedPath)) {
      // Redirect to their correct dashboard
      return NextResponse.redirect(new URL(allowedPath, nextUrl));
    }
  }

  return NextResponse.next();
});

/**
 * Matcher config — only run middleware on relevant routes.
 * Excludes static files, images, and API routes (except auth API).
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
