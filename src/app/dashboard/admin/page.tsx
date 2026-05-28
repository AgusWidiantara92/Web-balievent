import { signOut } from "@/auth";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { PendingEventsTable } from "./pending-events-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ShieldAlert,
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // 1. Ensure only logged-in user with ADMIN role can access
  const user = await requireRole("ADMIN");

  // 2. Fetch statistics and pending events concurrently for maximum speed
  const [
    totalEvents,
    pendingCount,
    approvedCount,
    totalUsers,
    totalOrganizers,
    pendingEvents,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.event.findMany({
      where: { status: "PENDING" },
      include: {
        organizer: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Newest pending events first
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-bali-sand/40 dark:bg-[#121214] py-8 sm:py-12">
      <Container>
        <div className="space-y-8">
          
          {/* Header Card / Top Welcome Banner */}
          <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-150/40 dark:border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-primary">
                <ShieldAlert className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-orange-100/60 dark:bg-orange-950/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light">
                  System Admin
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight">
                  Dasbor <span className="text-gradient">Administrator</span>
                </h1>
              </div>
            </div>

            {/* Actions Quick Menu */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard/admin/categories">
                <Button
                  variant="outline"
                  size="md"
                  className="font-bold border-primary text-primary hover:bg-orange-50 dark:hover:bg-orange-950/20 h-[46px] rounded-xl cursor-pointer"
                >
                  Kelola Kategori
                </Button>
              </Link>
              
              {/* Functional Sign Out form utilizing Server Action */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-900 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-all border border-gray-200/20 shadow-sm cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            
            {/* Stat 1: Total Event */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Event</p>
                <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mt-0.5">
                  {totalEvents}
                </h3>
              </div>
            </div>

            {/* Stat 2: Event Pending */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pending</p>
                <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {pendingCount}
                </h3>
              </div>
            </div>

            {/* Stat 3: Event Approved */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Approved</p>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {approvedCount}
                </h3>
              </div>
            </div>

            {/* Stat 4: Total User */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total User</p>
                <h3 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
                  {totalUsers}
                </h3>
              </div>
            </div>

            {/* Stat 5: Total Organizer */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300 col-span-2 lg:col-span-1">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Organizer</p>
                <h3 className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  {totalOrganizers}
                </h3>
              </div>
            </div>

          </div>

          {/* Table Moderasi Section */}
          <PendingEventsTable events={pendingEvents} />

        </div>
      </Container>
    </div>
  );
}
