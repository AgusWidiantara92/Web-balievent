import React from "react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { EditEventForm } from "./edit-event-form";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  // 1. Ensure only logged-in user with ORGANIZER role can access
  const user = await requireRole("ORGANIZER");

  // 2. Resolve parameters Promise in Next.js 15+
  const { id } = await params;

  // 3. Fetch event by ID from DB to check ownership
  const event = await prisma.event.findUnique({
    where: { id },
  });

  // 4. Secure Authorization Check: If event not found or not owned by current organizer, redirect
  if (!event || event.organizerId !== user.id) {
    redirect("/dashboard/organizer");
  }

  // 5. Fetch categories and locations dynamically from DB to populate dropdown options
  const [categories, locations] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.location.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
      },
      orderBy: {
        city: "asc",
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-bali-sand/40 dark:bg-[#121214] py-8 sm:py-12">
      <Container>
        <div className="space-y-8">
          
          {/* Top Header Card */}
          <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-150/40 dark:border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-secondary">
                <Compass className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-teal-100/60 dark:bg-teal-950/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Organizer Hub
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight">
                  Edit <span className="text-gradient">Informasi Event</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Form Component */}
          <EditEventForm event={event} categories={categories} locations={locations} />

        </div>
      </Container>
    </div>
  );
}
