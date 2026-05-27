import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Role type matching the Prisma enum
export type UserRole = "ADMIN" | "ORGANIZER" | "USER";

// Typed current user object returned by helpers
export type CurrentUser = {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  role: UserRole;
};

/**
 * getCurrentUser — Retrieves the currently authenticated user from the session.
 *
 * Returns the user object if logged in, or `null` if not.
 * Ideal for server components or server actions that need to check auth status
 * without forcing a redirect.
 *
 * @example
 * const user = await getCurrentUser();
 * if (user) { console.log(user.role); }
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

/**
 * requireAuth — Ensures the user is authenticated.
 *
 * If not logged in, the user is immediately redirected to `/login`.
 * Returns the guaranteed-authenticated user object.
 *
 * @example
 * export default async function ProtectedPage() {
 *   const user = await requireAuth();
 *   // user is guaranteed non-null here
 * }
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * requireRole — Ensures the user has one of the allowed roles.
 *
 * If not logged in, redirects to `/login`.
 * If logged in but role doesn't match, redirects to `/dashboard`
 * (which will route them to their correct dashboard).
 *
 * @param allowedRoles - One or more roles that are permitted.
 *
 * @example
 * // Single role
 * const user = await requireRole("ADMIN");
 *
 * // Multiple roles
 * const user = await requireRole("ADMIN", "ORGANIZER");
 */
export async function requireRole(
  ...allowedRoles: UserRole[]
): Promise<CurrentUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * getDashboardPathForRole — Returns the dashboard path for a given role.
 *
 * Useful for dynamic redirects after login, role checks, etc.
 */
export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "ORGANIZER":
      return "/dashboard/organizer";
    case "USER":
      return "/dashboard/user";
    default:
      return "/dashboard/user";
  }
}
