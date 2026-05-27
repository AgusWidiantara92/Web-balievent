import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { EventsContent } from "@/components/events/events-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Event - BaliEvent",
  description:
    "Jelajahi seluruh event budaya, pariwisata, kuliner, UMKM, workshop, dan seni di Bali.",
};

// Fallback mock data when database is not yet migrated
const mockEvents = [
  {
    id: "1",
    title: "Festival Budaya Ubud 2026",
    slug: "festival-budaya-ubud-2026",
    description:
      "Perayaan seni pertunjukan, lokakarya budaya, dan pameran seni rupa tahunan di Ubud.",
    poster:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    startDate: "2026-08-10T00:00:00.000Z",
    price: 150000,
    quota: 1000,
    category: { id: "c1", name: "Budaya", slug: "budaya" },
    location: { id: "l1", name: "Gianyar" },
  },
  {
    id: "2",
    title: "Pertunjukan Tari Kecak Uluwatu",
    slug: "pertunjukan-tari-kecak-uluwatu",
    description:
      "Dramatisasi kisah Ramayana melalui paduan suara ritmis tari kecak di Uluwatu.",
    poster:
      "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80",
    startDate: "2026-06-01T00:00:00.000Z",
    price: 150000,
    quota: 200,
    category: { id: "c2", name: "Seni", slug: "seni" },
    location: { id: "l2", name: "Badung" },
  },
  {
    id: "3",
    title: "Bali Culinary & Food Bazaar",
    slug: "bali-culinary-food-bazaar",
    description:
      "Pusat festival kuliner yang menyajikan kuliner otentik Bali dari babi guling hingga sate lilit.",
    poster:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    startDate: "2026-06-15T00:00:00.000Z",
    price: 0,
    quota: 300,
    category: { id: "c3", name: "Kuliner", slug: "kuliner" },
    location: { id: "l3", name: "Denpasar" },
  },
  {
    id: "4",
    title: "Workshop Membuat Canang Sari",
    slug: "workshop-membuat-canang-sari",
    description:
      "Pelajari seni melipat janur dan membuat canang sari sebagai persembahan harian masyarakat Bali.",
    poster:
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    startDate: "2026-06-20T00:00:00.000Z",
    price: 50000,
    quota: 30,
    category: { id: "c4", name: "Workshop", slug: "workshop" },
    location: { id: "l1", name: "Denpasar" },
  },
  {
    id: "5",
    title: "Pameran UMKM Bali Kreatif",
    slug: "pameran-umkm-bali-kreatif",
    description:
      "Pameran kerajinan tangan lokal, produk kreatif, dan inovasi UMKM terbaik dari seluruh Bali.",
    poster:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
    startDate: "2026-07-05T00:00:00.000Z",
    price: 0,
    quota: 500,
    category: { id: "c5", name: "UMKM", slug: "umkm" },
    location: { id: "l2", name: "Badung" },
  },
  {
    id: "6",
    title: "Desa Wisata Penglipuran Festival",
    slug: "desa-wisata-penglipuran-festival",
    description:
      "Festival kebudayaan dan pameran desa adat terbersih di dunia, menampilkan arsitektur tradisional.",
    poster:
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
    startDate: "2026-09-01T00:00:00.000Z",
    price: 25000,
    quota: 500,
    category: { id: "c6", name: "Pariwisata", slug: "pariwisata" },
    location: { id: "l4", name: "Bangli" },
  },
];

const mockCategories = [
  { id: "c1", name: "Budaya", slug: "budaya" },
  { id: "c2", name: "Seni", slug: "seni" },
  { id: "c3", name: "Kuliner", slug: "kuliner" },
  { id: "c4", name: "Workshop", slug: "workshop" },
  { id: "c5", name: "UMKM", slug: "umkm" },
  { id: "c6", name: "Pariwisata", slug: "pariwisata" },
  { id: "c7", name: "Musik", slug: "musik" },
  { id: "c8", name: "Komunitas", slug: "komunitas" },
];

const mockLocations = [
  { id: "l1", name: "Denpasar" },
  { id: "l2", name: "Badung" },
  { id: "l3", name: "Gianyar" },
  { id: "l4", name: "Bangli" },
  { id: "l5", name: "Tabanan" },
  { id: "l6", name: "Buleleng" },
  { id: "l7", name: "Karangasem" },
  { id: "l8", name: "Klungkung" },
  { id: "l9", name: "Jembrana" },
];

export type EventCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster: string;
  startDate: string;
  price: number;
  quota: number;
  category: { id: string; name: string; slug: string };
  location: { id: string; name: string };
};

export type FilterOption = {
  id: string;
  name: string;
  slug?: string;
};

export default async function EventsPage() {
  let events: EventCardData[] = [];
  let categories: FilterOption[] = mockCategories;
  let locations: FilterOption[] = mockLocations;

  try {
    const [dbEvents, dbCategories, dbLocations] = await Promise.all([
      prisma.event.findMany({
        where: { status: "APPROVED" },
        include: { category: true, location: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.location.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (dbEvents.length > 0) {
      events = dbEvents.map((evt) => ({
        id: evt.id,
        title: evt.title,
        slug: evt.slug,
        description: evt.description,
        poster:
          evt.poster ??
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        startDate: evt.startDate.toISOString(),
        price: evt.price,
        quota: evt.quota,
        category: {
          id: evt.category.id,
          name: evt.category.name,
          slug: evt.category.slug,
        },
        location: { id: evt.location.id, name: evt.location.name },
      }));
    }

    if (dbCategories.length > 0) {
      categories = dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));
    }

    if (dbLocations.length > 0) {
      locations = dbLocations.map((l) => ({ id: l.id, name: l.name }));
    }
  } catch {
    console.log(
      "Database not connected or not migrated. Using mock data for /events."
    );
  }

  // Fall back to mock data if DB returned nothing
  if (events.length === 0) {
    events = mockEvents;
  }

  return (
    <div className="py-12 min-h-screen">
      <Container>
        {/* Page Header */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Kalender Event <span className="text-gradient">Bali</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Temukan dan hadiri event budaya, pariwisata, kuliner, UMKM,
            workshop, dan seni terbaik di seluruh penjuru Bali.
          </p>
        </div>

        {/* Client-side interactive content: filters + cards + pagination */}
        <EventsContent
          events={events}
          categories={categories}
          locations={locations}
        />
      </Container>
    </div>
  );
}
