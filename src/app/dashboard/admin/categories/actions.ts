"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  description: z.string().optional(),
});

export type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Helper function to slugify category names
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

/**
 * createCategoryAction — Admin adds a new category
 */
export async function createCategoryAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  try {
    // 1. Authenticate user & ensure role is ADMIN
    await requireRole("ADMIN");

    // 2. Extract fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    // 3. Zod validation
    const validation = categorySchema.safeParse({ name, description });
    if (!validation.success) {
      return {
        success: false,
        message: "Validasi gagal. Silakan periksa kembali input Anda.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validatedData = validation.data;
    const slug = slugify(validatedData.name);

    if (!slug) {
      return {
        success: false,
        message: "Nama kategori tidak valid untuk dibuat menjadi slug.",
      };
    }

    // 4. Verify uniqueness of name or slug
    const conflict = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: validatedData.name, mode: "insensitive" } },
          { slug },
        ],
      },
    });

    if (conflict) {
      return {
        success: false,
        message: "Nama kategori atau slug ini sudah terdaftar. Silakan pilih nama lain.",
      };
    }

    // 5. Create category
    await prisma.category.create({
      data: {
        name: validatedData.name.trim(),
        slug,
        description: validatedData.description?.trim() || null,
      },
    });

    // 6. Revalidate cache
    revalidatePath("/dashboard/admin/categories");
    revalidatePath("/events");
    revalidatePath("/");

    return {
      success: true,
      message: "Kategori baru berhasil ditambahkan.",
    };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan internal server saat menambah kategori.",
    };
  }
}

/**
 * updateCategoryAction — Admin edits an existing category
 */
export async function updateCategoryAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  try {
    // 1. Authenticate user & ensure role is ADMIN
    await requireRole("ADMIN");

    // 2. Extract fields
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!id) {
      return { success: false, message: "ID Kategori tidak valid." };
    }

    // 3. Zod validation
    const validation = categorySchema.safeParse({ name, description });
    if (!validation.success) {
      return {
        success: false,
        message: "Validasi gagal. Silakan periksa kembali input Anda.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validatedData = validation.data;
    const slug = slugify(validatedData.name);

    if (!slug) {
      return {
        success: false,
        message: "Nama kategori tidak valid untuk dibuat menjadi slug.",
      };
    }

    // 4. Verify uniqueness of name or slug (excluding current category id)
    const conflict = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: validatedData.name, mode: "insensitive" } },
          { slug },
        ],
        id: { not: id },
      },
    });

    if (conflict) {
      return {
        success: false,
        message: "Nama kategori atau slug ini sudah terdaftar. Silakan pilih nama lain.",
      };
    }

    // 5. Update category in database
    await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name.trim(),
        slug,
        description: validatedData.description?.trim() || null,
      },
    });

    // 6. Revalidate cache
    revalidatePath("/dashboard/admin/categories");
    revalidatePath("/events");
    revalidatePath("/");

    return {
      success: true,
      message: "Kategori berhasil diperbarui.",
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan internal server saat mengubah kategori.",
    };
  }
}

/**
 * deleteCategoryAction — Admin deletes a category if not in use by any events
 */
export async function deleteCategoryAction(id: string): Promise<FormState> {
  try {
    // 1. Authenticate user & ensure role is ADMIN
    await requireRole("ADMIN");

    if (!id) {
      return { success: false, message: "ID Kategori tidak valid." };
    }

    // 2. Check if any event is currently using this category
    const eventCount = await prisma.event.count({
      where: { categoryId: id },
    });

    if (eventCount > 0) {
      return {
        success: false,
        message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${eventCount} event aktif.`,
      };
    }

    // 3. Delete category
    await prisma.category.delete({
      where: { id },
    });

    // 4. Revalidate cache
    revalidatePath("/dashboard/admin/categories");
    revalidatePath("/events");
    revalidatePath("/");

    return {
      success: true,
      message: "Kategori berhasil dihapus.",
    };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan internal server saat menghapus kategori.",
    };
  }
}
