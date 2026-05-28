"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions";
import {
  Tag,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FolderPlus,
  Loader2,
  Shield,
  BookOpen,
} from "lucide-react";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  eventCount: number;
  createdAt: string;
}

interface CategoriesClientProps {
  initialCategories: CategoryData[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Status messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-clear messages after 4 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = (cat: CategoryData) => {
    setError(null);
    setSuccess(null);
    setName(cat.name);
    setDescription(cat.description);
    setIsEditing(true);
    setEditId(cat.id);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError("Nama kategori minimal harus 3 karakter.");
      return;
    }

    setError(null);
    setSuccess(null);
    setActionLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (isEditing && editId) {
      formData.append("id", editId);
    }

    try {
      const result = isEditing
        ? await updateCategoryAction(null, formData)
        : await createCategoryAction(null, formData);

      if (result.success) {
        setSuccess(result.message || "Aksi berhasil diselesaikan.");
        resetForm();
        startTransition(() => {
          router.refresh();
        });
      } else {
        setError(result.message || "Terjadi kesalahan.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan internal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = async (id: string, catName: string) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus kategori "${catName}"?\nTindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        setSuccess(result.message || "Kategori berhasil dihapus.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        setError(result.message || "Gagal menghapus kategori.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan internal.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dasbor Admin
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Kelola Kategori <span className="text-gradient">Event</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase bg-white dark:bg-[#1c1c21] px-4 py-2 rounded-xl border border-gray-150 dark:border-gray-800">
          <Shield className="h-4 w-4 text-primary" />
          Administrator Mode
        </div>
      </div>

      {/* Alert Banner Notifications */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm flex gap-3 items-start animate-pulse">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm flex gap-3 items-start">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Panel (Left 1/3) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1c1c21] rounded-3xl p-6 shadow-xl border border-gray-150/40 dark:border-gray-800/80 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-primary">
              <FolderPlus className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {isEditing ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Nama Kategori
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Seni Pertunjukan, Musik Pantai"
                disabled={actionLoading}
                required
                className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Description textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan keterangan detail kategori ini..."
                rows={4}
                disabled={actionLoading}
                className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={actionLoading}
                className="w-full justify-center py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : isEditing ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Kategori"
                )}
              </Button>

              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                  className="w-full justify-center py-3 font-bold rounded-xl cursor-pointer"
                >
                  Batal Edit
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Table Panel (Right 2/3) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1c1c21] rounded-3xl p-6 shadow-xl border border-gray-150/40 dark:border-gray-800/80 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              Daftar Kategori Terdaftar
            </h3>
            <span className="text-xs font-bold text-secondary bg-teal-50 dark:bg-teal-950/20 px-3 py-1 rounded-full border border-teal-100/50 dark:border-teal-900/30">
              Total: {initialCategories.length} Kategori
            </span>
          </div>

          {initialCategories.length === 0 ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400 space-y-2">
              <Tag className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-sm font-medium">Belum ada kategori yang terdaftar.</p>
              <p className="text-xs text-gray-400">Silakan gunakan formulir sebelah kiri untuk menambahkan kategori pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4.5 px-4">Nama</th>
                    <th className="py-4.5 px-4">Slug</th>
                    <th className="py-4.5 px-4">Deskripsi</th>
                    <th className="py-4.5 px-4 text-center">Event</th>
                    <th className="py-4.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
                  {initialCategories.map((cat) => {
                    const isUsed = cat.eventCount > 0;

                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-bali-sand/5 dark:hover:bg-bali-charcoal/5 transition-colors group"
                      >
                        {/* Name */}
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                          {cat.name}
                        </td>
                        
                        {/* Slug */}
                        <td className="py-4 px-4">
                          <span className="font-mono text-xs bg-gray-50 dark:bg-gray-900 text-primary dark:text-primary-light px-2 py-0.5 rounded border border-gray-150 dark:border-gray-800">
                            {cat.slug}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-4 max-w-[200px] truncate text-gray-500 dark:text-gray-400" title={cat.description}>
                          {cat.description || <span className="italic text-gray-300">Tidak ada deskripsi</span>}
                        </td>

                        {/* Event count */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isUsed
                              ? "bg-teal-50 dark:bg-teal-950/20 text-secondary border border-teal-100 dark:border-teal-900/30"
                              : "bg-gray-50 dark:bg-gray-900 text-gray-400 border border-gray-150 dark:border-gray-800"
                          }`}>
                            {cat.eventCount}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* Edit button */}
                            <button
                              onClick={() => handleEditClick(cat)}
                              disabled={actionLoading}
                              title="Edit Kategori"
                              className="p-1.5 text-gray-500 hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg border border-transparent hover:border-orange-100 dark:hover:border-orange-900/30 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteClick(cat.id, cat.name)}
                              disabled={actionLoading || isUsed}
                              title={isUsed ? `Kategori masih digunakan oleh ${cat.eventCount} event aktif` : "Hapus Kategori"}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isUsed
                                  ? "text-gray-350 bg-gray-50/50 dark:bg-gray-900/20 border-transparent cursor-not-allowed opacity-40"
                                  : "text-gray-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer border-transparent"
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
