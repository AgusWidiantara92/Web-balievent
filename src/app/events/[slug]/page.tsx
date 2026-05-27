import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  ArrowLeft,
  Share2,
  Ticket,
  ChevronRight,
  Info,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";



interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Fetch Event Helper (Database query with mock fallback)
async function getEventData(slug: string) {
  try {
    const dbEvent = await prisma.event.findFirst({
      where: { slug, status: "APPROVED" },
      include: {
        category: true,
        location: true,
        organizer: true,
      },
    });

    if (dbEvent) {
      return {
        id: dbEvent.id,
        title: dbEvent.title,
        slug: dbEvent.slug,
        description: dbEvent.description,
        poster: dbEvent.poster ?? "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        startDate: dbEvent.startDate.toISOString(),
        endDate: dbEvent.endDate.toISOString(),
        startTime: dbEvent.startTime,
        endTime: dbEvent.endTime,
        price: dbEvent.price,
        quota: dbEvent.quota,
        category: {
          id: dbEvent.category.id,
          name: dbEvent.category.name,
          slug: dbEvent.category.slug,
        },
        location: {
          id: dbEvent.location.id,
          name: dbEvent.location.name,
          address: dbEvent.location.address,
          city: dbEvent.location.city,
        },
        organizer: {
          name: dbEvent.organizer.name ?? dbEvent.organizer.email.split("@")[0],
        },
      };
    }
  } catch (error) {
    console.log("Database fetch failed or tables do not exist. Falling back to mock data.");
  }

  return null;
}

// 2. Fetch Related Events Helper (same category, different id)
async function getRelatedEvents(categoryId: string, currentEventId: string) {
  try {
    const dbRelated = await prisma.event.findMany({
      where: {
        categoryId,
        id: { not: currentEventId },
        status: "APPROVED",
      },
      include: {
        category: true,
        location: true,
      },
      take: 3,
      orderBy: { startDate: "asc" },
    });

    if (dbRelated.length > 0) {
      return dbRelated.map((evt) => ({
        id: evt.id,
        title: evt.title,
        slug: evt.slug,
        poster: evt.poster ?? "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        startDate: evt.startDate.toISOString(),
        price: evt.price,
        quota: evt.quota,
        category: { name: evt.category.name, slug: evt.category.slug },
        location: { name: evt.location.name },
      }));
    }
  } catch {
    // Ignore error, handle fallback
  }

  return [];
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventData(slug);

  if (!event) {
    return {
      title: "Event Tidak Ditemukan - BaliEvent",
      description: "Halaman event tidak dapat ditemukan di sistem BaliEvent.",
    };
  }

  return {
    title: `${event.title} - BaliEvent`,
    description: event.description.substring(0, 160),
    openGraph: {
      title: `${event.title} - BaliEvent`,
      description: event.description.substring(0, 160),
      images: [{ url: event.poster }],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventData(slug);

  // If event not found in database or mock dataset, show notFound()
  if (!event) {
    notFound();
  }

  // Get related events
  const relatedEvents = await getRelatedEvents(event.category.id, event.id);

  // Date and Price Formatter Utilities
  const formatIndonesianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (priceVal: number) => {
    if (priceVal === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(priceVal);
  };

  const isSameDay = new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString();

  return (
    <div className="min-h-screen bg-bali-sand dark:bg-[#121214] pb-16">
      {/* 1. Backdrop / Banner Cover */}
      <div className="relative h-[180px] sm:h-[260px] w-full overflow-hidden bg-black">
        {/* Blurred background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
          style={{ backgroundImage: `url(${event.poster})` }}
        />
        {/* Soft overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bali-sand via-black/50 to-black/30 dark:from-[#121214]" />

        <Container className="relative h-full flex flex-col justify-center pt-4 z-10">
          {/* Breadcrumb / Back Button */}
          <div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black/40 hover:bg-black/60 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg hover:translate-x-[-2px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Event
            </Link>
          </div>
        </Container>
      </div>

      {/* 2. Main content container */}
      <Container className="relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Block (2/3 Column) */}
          <div className="lg:col-span-2 -mt-12 md:-mt-20 space-y-8">
            {/* Visual Overlap Poster for premium look */}
            <div className="relative group max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 transition-transform duration-300 hover:scale-[1.01]">
              <div className="relative aspect-[16/10] w-full">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Event Header Block (Visible on all viewports, clean and unblocked) */}
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-950/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary dark:text-orange-400">
                {event.category.name}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-secondary" />
                  {event.location.name}, {event.location.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatIndonesianDate(event.startDate)}
                </span>
              </div>
            </div>

            {/* Detail Deskripsi */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-150/60 dark:border-gray-800/80">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800/50">
                <Info className="h-5 w-5 text-secondary" />
                Tentang Event
              </h2>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line space-y-4">
                {event.description}
              </div>
            </div>

            {/* Organizer Block */}
            <div className="bg-white dark:bg-[#1c1c21] rounded-2xl p-6 shadow-sm border border-gray-150/60 dark:border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-primary font-bold text-xl border border-orange-100 dark:border-orange-900/40">
                  {event.organizer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Diselenggarakan oleh</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{event.organizer.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck className="h-4 w-4" />
                Penyelenggara Terverifikasi
              </div>
            </div>
          </div>

          {/* Right Block Sticky Info Widget (1/3 Column) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 bg-white/80 dark:bg-[#1c1c21]/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-800/80 space-y-6">
              
              {/* Price Tag with Gradient design */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-bali-sand dark:from-[#221c17] dark:to-[#1a1c21] border border-orange-100/50 dark:border-orange-900/20">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Harga Tiket</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-gradient">
                    {formatPrice(event.price)}
                  </span>
                  {event.price > 0 && <span className="text-xs font-semibold text-gray-400">/orang</span>}
                </div>
              </div>

              {/* Event Metadata Grid */}
              <div className="space-y-4 text-sm">
                
                {/* Waktu Pelaksanaan */}
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-orange-100/60 dark:bg-orange-950/30 text-primary h-9 w-9 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Tanggal & Waktu</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {isSameDay
                        ? formatIndonesianDate(event.startDate)
                        : `${formatIndonesianDate(event.startDate)} - ${formatIndonesianDate(event.endDate)}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mt-0.5">
                      Pukul {event.startTime} - {event.endTime} WITA
                    </p>
                  </div>
                </div>

                {/* Lokasi Alamat */}
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-teal-100/60 dark:bg-teal-950/30 text-secondary h-9 w-9 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Lokasi Pelaksanaan</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-medium text-primary">
                      {event.location.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 leading-relaxed">
                      {event.location.address}
                    </p>
                  </div>
                </div>

                {/* Kuota Peserta */}
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-blue-100/60 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 h-9 w-9 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Kuota Tersedia</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {event.quota} Kursi Maksimal
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-[15%]" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mt-1 block">Slot Terisi: 15%</span>
                  </div>
                </div>

              </div>

              {/* Action Register Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full justify-center py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-not-allowed"
                  disabled
                >
                  <Ticket className="h-5 w-5 mr-2" />
                  Daftar Event
                </Button>
                <p className="text-[11px] text-center text-gray-400 mt-2 font-medium">
                  *Pendaftaran untuk event ini belum dibuka atau sedang dalam peninjauan.
                </p>
              </div>

              {/* Share section */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold uppercase">Bagikan event ini</span>
                <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 3. Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Tag className="h-6 w-6 text-primary" />
                  Event Terkait
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Temukan event menarik sejenis di kategori <span className="font-semibold text-primary">{event.category.name}</span>
                </p>
              </div>
              <Link 
                href="/events" 
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((item) => (
                <Link
                  key={item.id}
                  href={`/events/${item.slug}`}
                  className="group bg-white dark:bg-[#1c1c21] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-150/60 dark:border-gray-800/80 transition-all flex flex-col h-full hover:translate-y-[-4px]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {item.category.name}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-secondary" />
                          {item.location.name}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/50">
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(item.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-sm font-bold text-gradient">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
