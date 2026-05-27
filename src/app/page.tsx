import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  Compass,
  Award,
} from "lucide-react";

const categories = [
  {
    name: "Budaya",
    slug: "budaya",
    description: "Upacara adat, ritual tradisi, & parade seni",
    count: 12,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    name: "Pariwisata",
    slug: "pariwisata",
    description: "Festival desa wisata & eksplorasi alam",
    count: 8,
    color: "from-teal-500 to-emerald-500",
    bg: "bg-teal-50 dark:bg-teal-950/20",
    text: "text-teal-600 dark:text-teal-400",
  },
  {
    name: "Kuliner",
    slug: "kuliner",
    description: "Festival jajanan tradisional & kuliner lokal",
    count: 15,
    color: "from-red-500 to-rose-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
  },
  {
    name: "UMKM",
    slug: "umkm",
    description: "Pameran kerajinan tangan & produk kreatif",
    count: 9,
    color: "from-amber-500 to-yellow-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  {
    name: "Workshop",
    slug: "workshop",
    description: "Belajar membuat canang, tari, & kerajinan",
    count: 6,
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Musik",
    slug: "musik",
    description: "Konser pantai, pertunjukan jazz, & festival lokal",
    count: 11,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
  },
];

const benefits = [
  {
    icon: Calendar,
    title: "Kalender Terupdate",
    description:
      "Dapatkan jadwal event kebudayaan dan pariwisata teraktual agar rencana liburan Anda lebih terstruktur.",
  },
  {
    icon: Compass,
    title: "Eksplorasi Budaya",
    description:
      "Temukan event-event unik tersembunyi seperti lokakarya adat dan festival desa tradisional khas Bali.",
  },
  {
    icon: Users,
    title: "Dukungan Komunitas",
    description:
      "Mendukung pelestarian budaya Bali dengan mempertemukan penyelenggara lokal dan penikmat seni.",
  },
  {
    icon: Award,
    title: "Tiket & Reservasi Mudah",
    description:
      "Daftar dan pesan tiket event secara online dengan cepat tanpa perlu antre di lokasi.",
  },
];

export default async function Home() {
  const popularEvents = await prisma.event.findMany({
    where: { status: "APPROVED" },
    include: {
      category: { select: { name: true } },
      location: { select: { name: true, city: true } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Formatting date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  // Price formatting helper
  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-orange-50/70 via-bali-sand to-transparent dark:from-[#2a1d17]/50 dark:via-[#121214] dark:to-[#121214]">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-3xl" />

        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              🌴 Jendela Budaya & Pariwisata Dewata
            </span>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Temukan Event Budaya & <br />
              <span className="text-gradient">Pariwisata Bali</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Jelajahi keindahan budaya Bali melalui event seni tradisional, pameran UMKM lokal,
              kelas workshop interaktif, festival kuliner lezat, dan konser musik terpopuler.
            </p>

            {/* 3. Search Bar Event */}
            <form
              action="/events"
              method="GET"
              className="w-full max-w-3xl bg-white dark:bg-[#1c1c21] p-2 rounded-2xl shadow-xl border border-gray-150 dark:border-gray-800/80 flex flex-col md:flex-row items-center gap-2 mt-4"
            >
              {/* Keyword Input */}
              <div className="relative w-full flex-grow flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
                <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Cari event adat, musik, tari..."
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative w-full md:w-48 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
                <Tag className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <select
                  name="category"
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer appearance-none"
                >
                  <option value="">Semua Kategori</option>
                  <option value="budaya">Budaya</option>
                  <option value="pariwisata">Pariwisata</option>
                  <option value="kuliner">Kuliner</option>
                  <option value="umkm">UMKM</option>
                  <option value="workshop">Workshop</option>
                  <option value="musik">Musik</option>
                </select>
              </div>

              {/* Location Input */}
              <div className="relative w-full md:w-48 flex items-center px-3 py-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  name="location"
                  placeholder="Semua Lokasi"
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200"
                />
              </div>

              {/* Search Button */}
              <Button type="submit" variant="primary" className="w-full md:w-auto px-6 py-2.5">
                Cari
              </Button>
            </form>
          </div>
        </Container>
      </section>

      {/* 4. Section Kategori Event */}
      <section className="py-20 bg-white dark:bg-[#121214] border-y border-gray-100 dark:border-gray-800/60">
        <Container>
          <div className="flex flex-col items-center text-center space-y-4 mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Cari Berdasarkan Kategori
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg">
              Temukan pengalaman autentik di Bali yang sesuai dengan minat dan hobi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/events?category=${cat.slug}`}
                className="group p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-bali-sand/10 dark:bg-bali-charcoal/10 hover:bg-white dark:hover:bg-[#1c1c21] hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/30 transition-all flex items-start space-x-4 text-left"
              >
                <div className={`p-4 rounded-xl ${cat.bg} ${cat.text} group-hover:scale-105 transition-transform flex-shrink-0`}>
                  <Tag className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {cat.count} Event
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-normal">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Section Event Populer */}
      <section className="py-20 bg-bali-sand/20 dark:bg-[#0c0c0e]">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14">
            <div className="space-y-4 text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Event Budaya & Pariwisata Populer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                Hadiri festival-festival terbaik pilihan wisatawan dan komunitas lokal.
              </p>
            </div>
            <Link href="/events" className="mt-4 sm:mt-0 flex-shrink-0">
              <Button variant="outline" className="group">
                Lihat Kalender Lengkap{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {popularEvents.length === 0 ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
              <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 w-16 h-16 flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Belum Ada Event</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal">
                  Saat ini belum ada event budaya atau pariwisata yang dipublikasikan. Organizer dapat membuat event baru melalui panel dasbor.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex flex-col bg-white dark:bg-[#121214] rounded-2xl border border-gray-200/60 dark:border-gray-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  {/* Poster */}
                  <div className="aspect-[16/10] w-full relative bg-gray-150 overflow-hidden">
                    <img
                      src={evt.poster || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-bali-charcoal/90 backdrop-blur-sm text-xs font-bold text-primary px-3 py-1 rounded-full border border-orange-100 dark:border-orange-950">
                      {evt.category.name}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between text-left">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-y-2 items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary animate-pulse" />
                          {formatDate(evt.startDate)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="mr-1.5 h-3.5 w-3.5 text-secondary" />
                          {evt.location.name} ({evt.location.city})
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-medium">
                        {evt.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block">Harga Tiket</span>
                        <span className="font-bold text-primary text-lg">
                          {formatPrice(evt.price)}
                        </span>
                      </div>
                      <Link href={`/events/${evt.slug}`}>
                        <Button variant="primary" size="sm">
                          Detail Event
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 6. Section Kenapa Menggunakan BaliEvent */}
      <section className="py-24 bg-white dark:bg-[#121214]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Header */}
            <div className="lg:col-span-5 flex flex-col items-start space-y-6 text-left">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                💡 Solusi Terbaik Anda
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Mengapa Memilih <br />
                <span className="text-gradient">BaliEvent?</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                Kami menyediakan sarana lengkap yang mempermudah masyarakat lokal maupun wisatawan mancanegara untuk menyatu dengan harmoni kebudayaan Bali.
              </p>
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-sm italic text-gray-500 dark:text-gray-400">
                  &ldquo;Nangun Sat Kerthi Loka Bali - Menjaga kesucian dan keharmonisan alam Bali beserta isinya.&rdquo;
                </p>
              </div>
            </div>

            {/* Right Features Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {benefits.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-gray-150 dark:border-gray-800 bg-bali-sand/5 dark:bg-bali-charcoal/5 flex flex-col items-start space-y-4 text-left"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* 7. CTA Daftar Sebagai Organizer */}
      <section className="py-16 bg-white dark:bg-[#121214] pb-24">
        <Container>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white py-16 px-8 sm:px-16 text-center">
            {/* Visual background overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Apakah Anda Penyelenggara Event di Bali?
              </h2>
              <p className="text-lg text-orange-50/90 max-w-xl mx-auto">
                Promosikan festival adat, kelas budaya, pameran kerajinan, atau pentas seni Anda ke ribuan penonton setia BaliEvent secara gratis dan profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register?role=organizer">
                  <Button
                    variant="outline"
                    className="bg-white text-orange-600 border-white hover:bg-orange-50 font-bold px-8 py-3 w-full sm:w-auto"
                  >
                    Daftar Sebagai Organizer
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 border border-white/20 font-medium px-8 py-3 w-full sm:w-auto"
                  >
                    Pelajari Selengkapnya
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
