"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const registrationSchema = z.object({
  eventId: z.string().min(1, "ID Event tidak valid"),
  ticketQuantity: z.number().int().min(1, "Jumlah tiket minimal 1"),
  notes: z.string().optional(),
});

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function registerForEventAction(
  eventId: string,
  ticketQuantity: number,
  notes?: string
): Promise<ActionState> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Anda harus masuk (login) terlebih dahulu untuk mendaftar event.",
      };
    }

    // 2. Validate input fields using Zod
    const validation = registrationSchema.safeParse({ eventId, ticketQuantity, notes });
    if (!validation.success) {
      return {
        success: false,
        message: "Validasi gagal. Silakan periksa input Anda.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // 3. Retrieve event and check if it is APPROVED
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return {
        success: false,
        message: "Event tidak ditemukan.",
      };
    }

    if (event.status !== "APPROVED") {
      return {
        success: false,
        message: "Pendaftaran gagal. Event ini belum disetujui atau tidak aktif.",
      };
    }

    // 4. Check if user already registered for the same event
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId: user.id,
        status: {
          in: ["REGISTERED", "ATTENDED", "NOT_ATTENDED"],
        },
      },
    });

    if (existingRegistration) {
      return {
        success: false,
        message: "Anda sudah terdaftar dalam event ini. Tidak boleh mendaftar lebih dari sekali.",
      };
    }

    // 5. Calculate remaining quota
    const activeRegistrations = await prisma.eventRegistration.findMany({
      where: {
        eventId,
        status: {
          in: ["REGISTERED", "ATTENDED", "NOT_ATTENDED"],
        },
      },
      select: {
        ticketQuantity: true,
      },
    });

    const totalRegisteredTickets = activeRegistrations.reduce(
      (sum, reg) => sum + reg.ticketQuantity,
      0
    );

    const remainingQuota = event.quota - totalRegisteredTickets;

    if (ticketQuantity > remainingQuota) {
      return {
        success: false,
        message: remainingQuota <= 0 
          ? "Pendaftaran gagal. Kuota event ini sudah penuh." 
          : `Pendaftaran gagal. Kuota tidak mencukupi. Kuota tersisa: ${remainingQuota} tiket.`,
      };
    }

    // 6. Calculate total price
    const totalPrice = ticketQuantity * event.price;

    // 7. Generate a unique registration code
    let registrationCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      registrationCode = `REG-EVT-${event.id.substring(0, 4).toUpperCase()}-${randomSuffix}`;
      
      const conflict = await prisma.eventRegistration.findUnique({
        where: { registrationCode },
      });

      if (!conflict) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      registrationCode = `REG-EVT-${event.id.substring(0, 4).toUpperCase()}-${Date.now()}`;
    }

    // 8. Save registration to database
    await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: user.id,
        registrationCode,
        ticketQuantity,
        totalPrice,
        notes: notes?.trim() || null,
        status: "REGISTERED",
      },
    });

    // 9. Revalidate pages to update remaining quota
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/dashboard/user/tickets");

    return {
      success: true,
      message: "Pendaftaran event berhasil dilakukan.",
    };
  } catch (error: any) {
    console.error("Error registering user to event:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan internal server saat mendaftar event.",
    };
  }
}
