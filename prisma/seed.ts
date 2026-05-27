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

  // 5. Seed Events (Removed default events to focus on organizer CRUD)
  console.log("Skipping default events seeding to focus on organizer CRUD events.");
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
