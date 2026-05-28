import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { EventsContent } from "@/components/events/events-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Event - BaliEvent",
  description:
    "Jelajahi seluruh event budaya, pariwisata, kuliner, UMKM, workshop, dan seni di Bali.",
};



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
