import { signOut } from "@/auth";
import { requireRole } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const user = await requireRole("USER");

  // 1. Fetch total registered events (excluding cancelled)
  const totalRegisteredEvents = await prisma.eventRegistration.count({
    where: {
      userId: user.id,
      status: { not: "CANCELLED" },
    },
  });

  // 2. Fetch upcoming events (startDate >= current time, and not cancelled)
  const upcomingRegistrations = await prisma.eventRegistration.findMany({
    where: {
      userId: user.id,
      status: { not: "CANCELLED" },
      event: {
        startDate: { gte: new Date() },
      },
    },
    include: {
      event: {
        include: {
          location: true,
          category: true,
        },
      },
    },
    orderBy: {
      event: {
        startDate: "asc",
      },
    },
    take: 3,
  });

  // 3. Fetch recent registrations history (latest 5)
  const recentRegistrations = await prisma.eventRegistration.findMany({
    where: { userId: user.id },
    include: {
      event: {
        include: {
          location: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Date Formatter Helper
  const formatIndonesianDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  // Price Formatter Helper
  const formatPrice = (priceVal: number) => {
    if (priceVal === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(priceVal);
  };

  return (
    <div className="min-h-screen bg-bali-sand dark:bg-[#121214] py-12">
      <Container>
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-150/40 dark:border-gray-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-primary">
                <UserIcon className="h-8 w-8" />
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primary/20 dark:text-primary-light">
                  User Account
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight">
                  Dasbor <span className="text-gradient">Pengunjung</span>
                </h1>
              </div>
            </div>

            {/* functional Sign Out button */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-900 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>

          {/* Main Grid: Profile/Stats (Left 1/3) & Events (Right 2/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile & Stats */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-6 shadow-md border border-gray-150/40 dark:border-gray-800/80 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg pb-2 border-b border-gray-100 dark:border-gray-800">
                  Profil Saya
                </h3>
                <div className="space-y-3.5 text-sm">
                  <div className="flex gap-2.5">
                    <UserIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-gray-400">Nama</p>
                      <p className="text-gray-800 dark:text-gray-200 font-semibold">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-gray-400">Email</p>
                      <p className="text-gray-800 dark:text-gray-200 font-semibold">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <Lock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-gray-400">Role</p>
                      <p className="text-primary font-bold">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Metric Card */}
              <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 shadow-lg text-white space-y-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <Ticket className="h-40 w-40" />
                </div>
                <h3 className="font-bold text-lg text-white/90">Statistik Saya</h3>
                <div className="pt-2">
                  <p className="text-3xl font-extrabold">{totalRegisteredEvents}</p>
                  <p className="text-xs text-white/80 font-medium mt-1 uppercase tracking-wide">
                    Event Diikuti (Aktif)
                  </p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <Link
                    href="/dashboard/user/tickets"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline"
                  >
                    Lihat Semua Tiket
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Upcoming Events & Recent History */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Upcoming Events Section */}
              <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-6 shadow-md border border-gray-150/40 dark:border-gray-800/80 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Event Mendatang
                  </h3>
                  {upcomingRegistrations.length > 0 && (
                    <span className="text-xs font-bold text-primary bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-full border border-orange-100/50 dark:border-orange-900/30">
                      {upcomingRegistrations.length} Event
                    </span>
                  )}
                </div>

                {upcomingRegistrations.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tidak ada tiket untuk event mendatang dalam waktu dekat.
                    </p>
                    <Link href="/events" className="inline-block">
                      <Button variant="outline" size="sm">
                        Cari Event Budaya
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {upcomingRegistrations.map((reg) => {
                      const event = reg.event;
                      return (
                        <div
                          key={reg.id}
                          className="flex flex-col bg-bali-sand/10 dark:bg-bali-charcoal/10 rounded-xl p-4 border border-gray-150/50 dark:border-gray-800/60 justify-between h-full"
                        >
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                              {event.category.name}
                            </span>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                              {event.title}
                            </h4>
                            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <p className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                {formatIndonesianDate(event.startDate)}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                                Pukul {event.startTime} WITA
                              </p>
                              <p className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                <span className="line-clamp-1">{event.location.name}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                            <span>{reg.ticketQuantity} Tiket</span>
                            <Link href={`/events/${event.slug}`} className="font-bold text-primary hover:underline">
                              Detail Event
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Registration History */}
              <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-6 shadow-md border border-gray-150/40 dark:border-gray-800/80 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-secondary" />
                  Riwayat Pendaftaran Terbaru
                </h3>

                {recentRegistrations.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada riwayat pendaftaran.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {recentRegistrations.map((reg) => {
                      const event = reg.event;
                      const isCancelled = reg.status === "CANCELLED";

                      return (
                        <div
                          key={reg.id}
                          className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                            isCancelled ? "opacity-50" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                              {event.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                              <span>Code: <span className="font-mono font-semibold text-primary">{reg.registrationCode}</span></span>
                              <span>{reg.ticketQuantity} Tiket</span>
                              <span>{formatPrice(reg.totalPrice)}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                              isCancelled
                                ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                                : reg.status === "ATTENDED"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                            }`}>
                              {reg.status === "REGISTERED" ? "Terdaftar" : reg.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(reg.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </Container>
    </div>
  );
}
