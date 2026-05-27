import { signOut } from "@/auth";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import {
  Compass,
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  Edit,
  AlertCircle,
  Tag,
  MapPin,
  TrendingUp,
} from "lucide-react";

export default async function OrganizerDashboardPage() {
  const user = await requireRole("ORGANIZER");

  // Query events from DB with categories and registrations
  const events = await prisma.event.findMany({
    where: {
      organizerId: user.id,
    },
    include: {
      category: true,
      location: true,
      registrations: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Newest events first
    },
  });

  // Calculate statistics
  const totalEvents = events.length;
  const pendingEvents = events.filter((e) => e.status === "PENDING").length;
  const approvedEvents = events.filter((e) => e.status === "APPROVED").length;
  
  // Calculate total registrations that are not cancelled
  const totalParticipants = events.reduce((sum, event) => {
    const activeRegs = event.registrations.filter((r) => r.status !== "CANCELLED");
    return sum + activeRegs.length;
  }, 0);

  // Formatting date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-bali-sand/40 dark:bg-[#121214] py-8 sm:py-12">
      <Container>
        <div className="space-y-8">
          
          {/* Top Banner / Welcome Header */}
          <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-150/40 dark:border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-secondary">
                <Compass className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-teal-100/60 dark:bg-teal-950/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Panel Penyelenggara
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight">
                  Dasbor <span className="text-gradient">Organizer</span>
                </h1>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard/organizer/events/create"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-500/10 active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Buat Event Baru
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-900 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-all border border-gray-200/20 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </form>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat 1: Total Event */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Event</p>
                <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mt-1">
                  {totalEvents}
                </h3>
              </div>
            </div>

            {/* Stat 2: Event Approved */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Approved</p>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {approvedEvents}
                </h3>
              </div>
            </div>

            {/* Stat 3: Event Pending */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pending</p>
                <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {pendingEvents}
                </h3>
              </div>
            </div>

            {/* Stat 4: Total Peserta */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-5 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex items-center gap-4 hover:translate-y-[-2px] transition-transform duration-300">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Peserta</p>
                <h3 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {totalParticipants}
                </h3>
              </div>
            </div>

          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Area: Events Table */}
            <div className="lg:col-span-9 space-y-6">
              <div className="bg-white dark:bg-[#1c1c21] rounded-3xl shadow-md border border-gray-150/40 dark:border-gray-800/80 overflow-hidden">
                
                {/* Table Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Daftar Event Saya
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Kelola status, kuota, dan pendaftar untuk semua acara Anda.
                    </p>
                  </div>
                </div>

                {/* Table Content */}
                {events.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 w-16 h-16 flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">Belum Ada Event</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Anda belum menambahkan event budaya atau pariwisata. Buat sekarang untuk menarik minat pengunjung!
                      </p>
                    </div>
                    <Link
                      href="/dashboard/organizer/events/create"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-teal-500/10 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Buat Event Pertama
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          <th className="py-4 px-6">Event</th>
                          <th className="py-4 px-4">Kategori & Lokasi</th>
                          <th className="py-4 px-4">Tanggal Mulai</th>
                          <th className="py-4 px-4 text-center">Status</th>
                          <th className="py-4 px-4 text-center">Peserta / Kuota</th>
                          <th className="py-4 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 text-sm">
                        {events.map((event) => {
                          const activeRegs = event.registrations.filter((r) => r.status !== "CANCELLED").length;
                          const fillPercentage = event.quota > 0 ? (activeRegs / event.quota) * 100 : 0;
                          
                          // Badge styling mapping
                          let statusClass = "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400";
                          let statusText: string = event.status;
                          if (event.status === "PENDING") {
                            statusClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
                            statusText = "Menunggu";
                          } else if (event.status === "APPROVED") {
                            statusClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
                            statusText = "Disetujui";
                          } else if (event.status === "REJECTED") {
                            statusClass = "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400";
                            statusText = "Ditolak";
                          } else if (event.status === "CANCELLED") {
                            statusClass = "bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-500";
                            statusText = "Batal";
                          } else if (event.status === "COMPLETED") {
                            statusClass = "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
                            statusText = "Selesai";
                          }

                          return (
                            <tr key={event.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors group">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {event.poster ? (
                                    <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-150/40 dark:border-gray-800">
                                      <img
                                        src={event.poster}
                                        alt={event.title}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-12 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-150/40 dark:border-gray-800">
                                      <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="max-w-[200px] sm:max-w-[260px] truncate">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                      {event.title}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                      ID: {event.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                                    <Tag className="h-3 w-3" />
                                    {event.category.name}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate max-w-[150px]">
                                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    {event.location.name}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                                {formatDate(event.startDate)}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${statusClass}`}>
                                  {statusText}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1.5 max-w-[100px] mx-auto">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{activeRegs}</span>
                                    <span className="text-gray-400">/ {event.quota}</span>
                                  </div>
                                  {/* Progress bar indicator */}
                                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        fillPercentage >= 90
                                          ? "bg-red-500"
                                          : fillPercentage >= 70
                                          ? "bg-amber-500"
                                          : "bg-teal-500"
                                      }`}
                                      style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/events/${event.slug}`}
                                    className="p-2 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 dark:bg-gray-900 dark:hover:bg-teal-950/30 dark:hover:text-teal-400 rounded-lg text-gray-400 transition-colors border border-transparent hover:border-teal-100 dark:hover:border-teal-900/30"
                                    title="Lihat Detail Halaman Publik"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  <Link
                                    href={`/dashboard/organizer/events/${event.id}/edit`}
                                    className="p-2 bg-gray-50 hover:bg-amber-50 hover:text-amber-600 dark:bg-gray-900 dark:hover:bg-amber-950/30 dark:hover:text-amber-400 rounded-lg text-gray-400 transition-colors border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30"
                                    title="Edit Informasi Event"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>

            {/* Right Area: Sidebar Profile & Tips */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-6 shadow-md border border-gray-150/40 dark:border-gray-800/80 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-teal-500" />
                  Profil Organizer
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Nama Akun</p>
                    <p className="text-gray-800 dark:text-gray-200 font-bold text-sm">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Alamat Email</p>
                    <p className="text-gray-800 dark:text-gray-200 font-semibold break-all">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Tipe Akun</p>
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 dark:bg-teal-950/20 dark:text-teal-400">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide/Tips Box */}
              <div className="bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-transparent rounded-3xl p-6 shadow-sm border border-teal-500/10 dark:border-teal-900/20 space-y-3.5">
                <div className="flex gap-2 text-teal-600 dark:text-teal-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Panduan Pengajuan</h4>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed list-disc list-inside">
                  <li>Event baru yang dibuat akan berstatus <strong className="text-amber-600">PENDING</strong> secara default.</li>
                  <li>Tim Admin BaliEvent akan memverifikasi kelayakan isi event pariwisata atau budaya Anda dalam 1x24 jam.</li>
                  <li>Setelah mendapat persetujuan (<strong className="text-emerald-600">APPROVED</strong>), event akan tampil di halaman utama BaliEvent secara otomatis.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </Container>
    </div>
  );
}
