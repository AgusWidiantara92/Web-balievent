import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  QrCode,
  Info,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserTicketsPage() {
  // 1. Authenticate user
  const user = await requireRole("USER");

  // 2. Fetch registrations
  const registrations = await prisma.eventRegistration.findMany({
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
  });

  // 3. Generate QR codes for all tickets
  const tickets = await Promise.all(
    registrations.map(async (reg) => {
      let qrCodeDataUrl = "";
      try {
        qrCodeDataUrl = await QRCode.toDataURL(reg.registrationCode, {
          margin: 1,
          width: 200,
          color: {
            dark: "#0f172a", // slate-900 for high contrast
            light: "#ffffff",
          },
        });
      } catch (err) {
        console.error("QR Code generation failed:", err);
      }
      return {
        ...reg,
        qrCodeDataUrl,
      };
    })
  );

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
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header & Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Link
                href="/dashboard/user"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke Dasbor
              </Link>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Tiket <span className="text-gradient">Registrasi</span> Saya
              </h1>
            </div>
            <Link href="/events">
              <Button variant="primary" size="sm">
                Temukan Event Baru
              </Button>
            </Link>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-16 text-center shadow-md border border-gray-150/40 dark:border-gray-800/80 space-y-6 max-w-lg mx-auto">
              <div className="h-16 w-16 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto text-primary border border-orange-100 dark:border-orange-900/40">
                <Ticket className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Belum Ada Tiket</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Anda belum pernah mendaftar ke event apa pun. Jelajahi kalender event BaliEvent dan daftarkan diri Anda sekarang!
                </p>
              </div>
              <Link href="/events" className="inline-block">
                <Button variant="primary" className="px-8">
                  Cari Event Menarik
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((reg) => {
                const event = reg.event;
                const isCancelled = reg.status === "CANCELLED";

                return (
                  <div
                    key={reg.id}
                    className={`bg-white dark:bg-[#1c1c21] rounded-3xl overflow-hidden shadow-lg border ${
                      isCancelled
                        ? "border-gray-200 dark:border-gray-800 opacity-60"
                        : "border-gray-150/50 dark:border-gray-800/80"
                    } flex flex-col md:flex-row`}
                  >
                    
                    {/* Ticket Image / Left visual part */}
                    <div className="md:w-1/4 relative aspect-video md:aspect-auto min-h-[140px] bg-gray-150 dark:bg-gray-800 flex-shrink-0">
                      <img
                        src={event.poster || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 dark:bg-bali-charcoal/95 backdrop-blur-sm text-[10px] font-bold text-primary px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-950/30">
                        {event.category.name}
                      </div>
                    </div>

                    {/* Ticket Content / Middle part */}
                    <div className="flex-1 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-gray-200 dark:border-gray-800 text-left">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                            isCancelled
                              ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                              : reg.status === "ATTENDED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                              : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                          }`}>
                            {reg.status === "REGISTERED" ? "Terdaftar" : reg.status}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            Daftar: {new Date(reg.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })} WITA
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                          {event.title}
                        </h3>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{formatIndonesianDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-secondary flex-shrink-0" />
                            <span>Pukul {event.startTime} - {event.endTime} WITA</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                            <span className="line-clamp-1">{event.location.name} ({event.location.city})</span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket pricing info */}
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-gray-400">Jumlah: </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{reg.ticketQuantity} Tiket</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Bayar: </span>
                          <span className="font-extrabold text-primary text-sm">{formatPrice(reg.totalPrice)}</span>
                        </div>
                      </div>

                      {/* Notes / Catatan */}
                      {reg.notes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block text-gray-700 dark:text-gray-300">Catatan pendaftaran:</span>
                            <span className="italic">"{reg.notes}"</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ticket QR Stub / Right part */}
                    <div className="md:w-1/4 p-6 bg-bali-sand/20 dark:bg-bali-charcoal/10 flex flex-col items-center justify-center text-center gap-3">
                      <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 flex items-center justify-center overflow-hidden h-[112px] w-[112px] flex-shrink-0">
                        {reg.qrCodeDataUrl ? (
                          <img
                            src={reg.qrCodeDataUrl}
                            alt={`QR Code ${reg.registrationCode}`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <QrCode className="h-14 w-14 text-gray-800" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration Code</p>
                        <p className="font-mono font-bold text-xs text-primary dark:text-primary-light select-all px-2.5 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-150 dark:border-gray-750">
                          {reg.registrationCode}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </Container>
    </div>
  );
}
