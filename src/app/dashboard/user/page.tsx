import { signOut } from "@/auth";
import { requireRole } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Ticket,
  Calendar,
  Heart,
} from "lucide-react";

export default async function UserDashboardPage() {
  const user = await requireRole("USER");

  return (
    <div className="min-h-screen bg-bali-sand dark:bg-[#121214] py-12">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          
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

            {/* Functional Sign Out form utilizing Server Action */}
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

          {/* Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* User Profile Card */}
            <div className="md:col-span-1 bg-white dark:bg-[#1c1c21] rounded-2xl p-6 shadow-md border border-gray-150/40 dark:border-gray-800/80 space-y-4">
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

            {/* Quick Actions Placeholder */}
            <div className="md:col-span-2 bg-white dark:bg-[#1c1c21] rounded-2xl p-6 shadow-md border border-gray-150/40 dark:border-gray-800/80 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg pb-2 border-b border-gray-100 dark:border-gray-800">
                  Aktivitas Tiket & Favorit
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                  Selamat datang kembali di dasbor pengunjung BaliEvent! Di sini Anda dapat melihat tiket pendaftaran event budaya yang aktif, mengunduh kode QR registrasi untuk dipindai di lokasi acara, dan melihat riwayat event budaya & pariwisata yang telah Anda hadiri.
                </p>
              </div>

              {/* Action grid dummy for beautiful styling */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100/50 dark:border-orange-900/30 text-center cursor-pointer hover:scale-[1.02] transition-transform">
                  <Ticket className="h-5 w-5 text-primary mx-auto mb-1" />
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Tiket Saya</span>
                </div>
                <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-xl border border-teal-100/50 dark:border-teal-900/30 text-center cursor-pointer hover:scale-[1.02] transition-transform">
                  <Heart className="h-5 w-5 text-secondary mx-auto mb-1" />
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Event Favorit</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-center cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-center">
                  <Calendar className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Cari Event</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </Container>
    </div>
  );
}
