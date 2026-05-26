import { PrismaClient, Role, EventStatus } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  // 1. Clean Database
  await prisma.eventReview.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared.");

  // 2. Seed Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin BaliEvent",
      email: "admin@balievent.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: "Organizer Bali",
      email: "organizer@balievent.com",
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Wayan Kadek",
      email: "user@balievent.com",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  console.log("Users seeded successfully.");

  // 3. Seed Categories
  const categoriesData = [
    { name: "Budaya", slug: "budaya", description: "Event adat istiadat, ritual keagamaan, dan tradisi lokal Bali." },
    { name: "Pariwisata", slug: "pariwisata", description: "Event promosi destinasi wisata, festival desa, dan alam." },
    { name: "Kuliner", slug: "kuliner", description: "Event jajanan tradisional, makanan khas Bali, dan pesta kuliner." },
    { name: "UMKM", slug: "umkm", description: "Pameran kerajinan tangan lokal, produk kreatif, dan pameran bisnis." },
    { name: "Workshop", slug: "workshop", description: "Kelas interaktif, belajar budaya Bali, menari, memasak, dan kerajinan." },
    { name: "Musik", slug: "musik", description: "Konser musik, festival lagu Bali, akustik pantai, dan jazz." },
    { name: "Seni", slug: "seni", description: "Pameran lukisan, pertunjukan tari tradisional, teater, dan seni rupa." },
    { name: "Komunitas", slug: "komunitas", description: "Pertemuan komunitas pemuda, pelestarian lingkungan, dan hobi." },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }

  console.log("Categories seeded successfully.");

  // 4. Seed Locations
  const locationsData = [
    { name: "Denpasar", address: "Kota Denpasar, Bali", city: "Denpasar" },
    { name: "Badung", address: "Kabupaten Badung (Kuta, Seminyak, Uluwatu), Bali", city: "Badung" },
    { name: "Gianyar", address: "Kabupaten Gianyar (Ubud, Sukawati), Bali", city: "Gianyar" },
    { name: "Tabanan", address: "Kabupaten Tabanan (Bedugul, Tanah Lot), Bali", city: "Tabanan" },
    { name: "Buleleng", address: "Kabupaten Buleleng (Lovina, Singaraja), Bali", city: "Buleleng" },
    { name: "Karangasem", address: "Kabupaten Karangasem (Amed, Candidasa), Bali", city: "Karangasem" },
    { name: "Klungkung", address: "Kabupaten Klungkung (Nusa Penida), Bali", city: "Klungkung" },
    { name: "Bangli", address: "Kabupaten Bangli (Kintamani, Penglipuran), Bali", city: "Bangli" },
    { name: "Jembrana", address: "Kabupaten Jembrana (Negara), Bali", city: "Jembrana" },
  ];

  const locations: Record<string, any> = {};
  for (const loc of locationsData) {
    locations[loc.name.toLowerCase()] = await prisma.location.create({
      data: loc,
    });
  }

  console.log("Locations seeded successfully.");

  // 5. Seed Events
  const eventsData = [
    {
      title: "Festival Budaya Ubud",
      slug: "festival-budaya-ubud",
      description: "Festival tahunan yang merayakan seni, musik, dan budaya Bali di pusat kebudayaan Ubud.",
      poster: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2026-08-10T00:00:00.000Z"),
      endDate: new Date("2026-08-15T00:00:00.000Z"),
      startTime: "09:00",
      endTime: "22:00",
      price: 150000,
      quota: 1000,
      status: EventStatus.APPROVED,
      organizerId: organizer.id,
      categoryId: categories["budaya"].id,
      locationId: locations["gianyar"].id,
    },
    {
      title: "Workshop Membuat Canang",
      slug: "workshop-membuat-canang",
      description: "Pelajari seni melipat janur dan membuat canang sari sebagai persembahan harian masyarakat Bali.",
      poster: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2026-06-20T00:00:00.000Z"),
      endDate: new Date("2026-06-20T00:00:00.000Z"),
      startTime: "14:00",
      endTime: "17:00",
      price: 50000,
      quota: 30,
      status: EventStatus.APPROVED,
      organizerId: organizer.id,
      categoryId: categories["workshop"].id,
      locationId: locations["denpasar"].id,
    },
    {
      title: "Pameran UMKM Bali",
      slug: "pameran-umkm-bali",
      description: "Pameran kerajinan tangan lokal, produk kreatif, dan inovasi UMKM terbaik dari seluruh Bali.",
      poster: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2026-07-05T00:00:00.000Z"),
      endDate: new Date("2026-07-08T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "22:00",
      price: 0,
      quota: 500,
      status: EventStatus.APPROVED,
      organizerId: organizer.id,
      categoryId: categories["umkm"].id,
      locationId: locations["badung"].id,
    },
    {
      title: "Bali Culinary Night",
      slug: "bali-culinary-night",
      description: "Menikmati aneka kuliner tradisional Bali khas daerah seperti sate lilit, lawar, dan babi guling.",
      poster: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2026-06-15T00:00:00.000Z"),
      endDate: new Date("2026-06-16T00:00:00.000Z"),
      startTime: "17:00",
      endTime: "23:00",
      price: 0,
      quota: 300,
      status: EventStatus.APPROVED,
      organizerId: organizer.id,
      categoryId: categories["kuliner"].id,
      locationId: locations["denpasar"].id,
    },
    {
      title: "Tari Kecak Performance",
      slug: "tari-kecak-performance",
      description: "Pertunjukan seni tari kecak yang spektakuler dengan latar belakang matahari terbenam di Pura Uluwatu.",
      poster: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2026-06-01T00:00:00.000Z"),
      startTime: "18:00",
      endTime: "19:00",
      price: 150000,
      quota: 200,
      status: EventStatus.APPROVED,
      organizerId: organizer.id,
      categoryId: categories["seni"].id,
      locationId: locations["badung"].id,
    },
    {
      title: "Desa Wisata Penglipuran Festival",
      slug: "desa-wisata-penglipuran-festival",
      description: "Festival kebudayaan dan pameran desa adat terbersih di dunia, menampilkan arsitektur tradisional dan keramahtamahan warga.",
      poster: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-05T00:00:00.000Z"),
      startTime: "08:00",
      endTime: "18:00",
      price: 25000,
      quota: 500,
      status: EventStatus.PENDING,
      organizerId: organizer.id,
      categoryId: categories["pariwisata"].id,
      locationId: locations["bangli"].id,
    },
  ];

  for (const evt of eventsData) {
    await prisma.event.create({
      data: evt,
    });
  }

  console.log("Events seeded successfully.");
  console.log("Seeding finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
