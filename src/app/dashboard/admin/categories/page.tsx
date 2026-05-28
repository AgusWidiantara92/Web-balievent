import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { CategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  // 1. Authenticate user & ensure role is ADMIN
  await requireRole("ADMIN");

  // 2. Fetch all categories including event counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { events: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Map to a clean, serializable format for client component
  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
    eventCount: cat._count.events,
    createdAt: cat.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-bali-sand/40 dark:bg-[#121214] py-8 sm:py-12">
      <Container>
        <CategoriesClient initialCategories={formattedCategories} />
      </Container>
    </div>
  );
}
