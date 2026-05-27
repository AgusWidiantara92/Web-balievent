import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // 1. If not logged in, redirect to login page
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;

  // 2. Redirect based on user role to their specific sub-dashboard
  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (role === "ORGANIZER") {
    redirect("/dashboard/organizer");
  } else {
    redirect("/dashboard/user");
  }
}
