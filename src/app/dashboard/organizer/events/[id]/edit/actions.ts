"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Define the validation schema using Zod
const updateEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, "Judul event minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi event minimal 10 karakter"),
  categoryId: z.string().min(1, "Silakan pilih kategori"),
  locationId: z.string().min(1, "Silakan pilih lokasi"),
  poster: z.string().url("Poster harus berupa URL yang valid (e.g. https://...)"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().min(1, "Tanggal selesai harus diisi"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu mulai tidak valid (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu selesai tidak valid (HH:MM)"),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Harga tidak boleh negatif")),
  quota: z.preprocess((val) => Number(val), z.number().int().min(1, "Kuota minimal 1")),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
  path: ["endDate"],
});

export type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Helper function to slugify text
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")          // Replace spaces with -
    .replace(/[^\w\-]+/g, "")      // Remove all non-word chars
    .replace(/\-\-+/g, "-")        // Replace multiple - with single -
    .replace(/^-+/, "")            // Trim - from start of text
    .replace(/-+$/, "");           // Trim - from end of text
}

export async function updateEventAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  let isSuccess = false;

  try {
    // 1. Authenticate user & ensure role is ORGANIZER
    const user = await requireRole("ORGANIZER");

    // 2. Extract fields from FormData
    const rawData = {
      id: formData.get("id") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string,
      locationId: formData.get("locationId") as string,
      poster: formData.get("poster") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      price: formData.get("price") as string,
      quota: formData.get("quota") as string,
    };

    // 3. Validate with Zod
    const validatedFields = updateEventSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validasi gagal. Silakan periksa kembali input Anda.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // 4. Fetch the existing event to verify existence and ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id: data.id },
    });

    if (!existingEvent) {
      return {
        success: false,
        message: "Event tidak ditemukan.",
      };
    }

    if (existingEvent.organizerId !== user.id) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengedit event ini.",
      };
    }

    // 5. Generate unique slug if title has changed
    let slug = existingEvent.slug;
    if (data.title !== existingEvent.title) {
      slug = slugify(data.title);
      const slugConflict = await prisma.event.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== existingEvent.id) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    // 6. If status is APPROVED, reset to PENDING
    const newStatus = existingEvent.status === "APPROVED" ? "PENDING" : existingEvent.status;

    // 7. Convert date strings to Date objects
    const startDateObj = new Date(`${data.startDate}T00:00:00.000Z`);
    const endDateObj = new Date(`${data.endDate}T00:00:00.000Z`);

    // 8. Update event in database
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug,
        description: data.description,
        poster: data.poster,
        startDate: startDateObj,
        endDate: endDateObj,
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price,
        quota: data.quota,
        status: newStatus,
        categoryId: data.categoryId,
        locationId: data.locationId,
      },
    });

    isSuccess = true;
  } catch (error: any) {
    console.error("Error updating event:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan server internal saat memperbarui event.",
    };
  }

  // Perform revalidation and redirection outside of the try-catch block
  if (isSuccess) {
    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");
    revalidatePath("/");
    redirect("/dashboard/organizer");
  }

  return { success: false };
}

export async function deleteEventAction(
  eventId: string
): Promise<FormState> {
  let isSuccess = false;

  try {
    // 1. Authenticate user & ensure role is ORGANIZER
    const user = await requireRole("ORGANIZER");

    if (!eventId) {
      return {
        success: false,
        message: "ID Event tidak valid.",
      };
    }

    // 2. Fetch the existing event to verify existence and ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return {
        success: false,
        message: "Event tidak ditemukan.",
      };
    }

    if (existingEvent.organizerId !== user.id) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus event ini.",
      };
    }

    // 3. Delete event from database
    await prisma.event.delete({
      where: { id: eventId },
    });

    isSuccess = true;
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan server internal saat menghapus event.",
    };
  }

  // 4. Perform revalidation and redirection outside of the try-catch block
  if (isSuccess) {
    revalidatePath("/dashboard/organizer");
    revalidatePath("/events");
    revalidatePath("/");
    redirect("/dashboard/organizer");
  }

  return { success: false };
}
