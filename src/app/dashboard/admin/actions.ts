"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success: boolean;
  message?: string;
};

/**
 * approveEventAction — Approves a pending event.
 * Changes its status to APPROVED, making it visible to the public.
 */
export async function approveEventAction(eventId: string): Promise<ActionState> {
  try {
    // 1. Authenticate user & ensure role is ADMIN
    await requireRole("ADMIN");

    if (!eventId) {
      return { success: false, message: "ID Event tidak valid." };
    }

    // 2. Update event status to APPROVED
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "APPROVED",
        rejectionReason: null, // Clear any previous rejection reasons
      },
    });

    // 3. Revalidate dashboard and public events pages
    revalidatePath("/dashboard/admin");
    revalidatePath("/events");

    return { success: true, message: "Event berhasil disetujui." };
  } catch (error: any) {
    console.error("Error approving event:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan server internal saat menyetujui event.",
    };
  }
}

/**
 * rejectEventAction — Rejects a pending event.
 * Changes its status to REJECTED.
 */
export async function rejectEventAction(
  eventId: string,
  reason?: string
): Promise<ActionState> {
  try {
    // 1. Authenticate user & ensure role is ADMIN
    await requireRole("ADMIN");

    if (!eventId) {
      return { success: false, message: "ID Event tidak valid." };
    }

    // 2. Update event status to REJECTED
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "REJECTED",
        rejectionReason: reason || "Ditolak oleh administrator.",
      },
    });

    // 3. Revalidate dashboard
    revalidatePath("/dashboard/admin");

    return { success: true, message: "Event berhasil ditolak." };
  } catch (error: any) {
    console.error("Error rejecting event:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan server internal saat menolak event.",
    };
  }
}
