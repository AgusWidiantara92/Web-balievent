import React from "react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { CreateEventForm } from "./create-event-form";
import { Compass } from "lucide-react";

export default async function CreateEventPage() {
  // Ensure only logged-in user with ORGANIZER role can access
  await requireRole("ORGANIZER");

  // Fetch categories and locations dynamically from DB to populate dropdown options
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
                  Buat <span className="text-gradient">Event Baru</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Form Component */}
          <CreateEventForm categories={categories} locations={locations} />

        </div>
      </Container>
    </div>
  );
}
