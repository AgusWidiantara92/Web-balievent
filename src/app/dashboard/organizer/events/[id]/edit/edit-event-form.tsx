"use client";

import React, { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { updateEventAction, deleteEventAction, FormState } from "./actions";
import {
  Calendar,
  Clock,
  Tag,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Users,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  poster: string | null;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  price: number;
  quota: number;
  status: string;
  categoryId: string;
  locationId: string;
}

interface EditEventFormProps {
  event: EventData;
  categories: Category[];
  locations: Location[];
}

const initialState: FormState = {
  success: false,
};

export function EditEventForm({ event, categories, locations }: EditEventFormProps) {
  // Use React 19 useActionState hook for form action
  const [state, formAction, isPending] = useActionState(updateEventAction, initialState);
  
  // Transition hook for deleting
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Real-time poster URL preview
  const [posterUrl, setPosterUrl] = useState(event.poster || "");
  const [showPreview, setShowPreview] = useState(!!event.poster);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPosterUrl(url);
    if (url.startsWith("http://") || url.startsWith("https://")) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  // Delete event handler
  const handleDelete = () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus event "${event.title}"?\n\nTindakan ini bersifat permanen dan tidak dapat dibatalkan.`
    );
    
    if (confirmed) {
      setDeleteError(null);
      startDeleteTransition(async () => {
        try {
          const result = await deleteEventAction(event.id);
          if (result && !result.success) {
            setDeleteError(result.message || "Gagal menghapus event.");
          }
        } catch (error: any) {
          setDeleteError(error.message || "Terjadi kesalahan sistem.");
        }
      });
    }
  };

  // Format date to YYYY-MM-DD for input value
  const formatDateToInput = (dateInput: Date) => {
    const d = new Date(dateInput);
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${year}-${month}-${day}`;
  };

  // Determine badge for current status
  let statusBadge = "";
  let statusClass = "";
  if (event.status === "PENDING") {
    statusBadge = "MENUNGGU PERSETUJUAN";
    statusClass = "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
  } else if (event.status === "APPROVED") {
    statusBadge = "DISETUJUI";
    statusClass = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
  } else if (event.status === "REJECTED") {
    statusBadge = "DITOLAK";
    statusClass = "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30";
  } else {
    statusBadge = event.status;
    statusClass = "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-800";
  }

  const anyLoading = isPending || isDeleting;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Back Button & Action Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/dashboard/organizer"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dasbor
        </Link>
        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${statusClass}`}>
          <Sparkles className="h-3 w-3" />
          Status Saat Ini: {statusBadge}
        </div>
      </div>

      {/* Global Error Banner */}
      {((state?.message && !state.errors) || deleteError) && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm font-semibold">{state?.message || deleteError}</p>
        </div>
      )}

      {/* Approved Status Warning Notice */}
      {event.status === "APPROVED" && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-4 rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <p className="text-sm font-bold">Perhatian: Event Sudah Disetujui</p>
            <p className="text-xs text-gray-600 dark:text-amber-300/80 mt-1">
              Karena event ini telah disetujui (APPROVED), penyuntingan informasi apa pun akan mengubah status event kembali menjadi **PENDING** agar dapat ditinjau ulang oleh admin demi menjaga keakuratan info bagi pengunjung.
            </p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form action={formAction} className="bg-white dark:bg-[#1c1c21] rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-150/40 dark:border-gray-800/80 space-y-8">
        
        {/* Hidden Field for Event ID */}
        <input type="hidden" name="id" value={event.id} />

        {/* Section 1: Detail Utama */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-500" />
              Detail Informasi Event
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Perbarui detail acara budaya atau pariwisata Anda agar selalu menarik dan akurat.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Judul Event <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={event.title}
              disabled={anyLoading}
              placeholder="Contoh: Festival Budaya Ubud Kuno"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold placeholder-gray-400 disabled:opacity-60"
            />
            {state?.errors?.title && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {state.errors.title[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Deskripsi Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              defaultValue={event.description}
              disabled={anyLoading}
              placeholder="Jelaskan keunikan acara Anda, susunan kegiatan, dan daya tarik utama yang ditawarkan..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium placeholder-gray-400 resize-none disabled:opacity-60"
            />
            {state?.errors?.description && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {state.errors.description[0]}
              </p>
            )}
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="categoryId" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Kategori Event <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Tag className="h-5 w-5" />
                </div>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  defaultValue={event.categoryId}
                  disabled={anyLoading}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold appearance-none disabled:opacity-60"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-gray-900 dark:text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {state?.errors?.categoryId && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.categoryId[0]}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="locationId" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Lokasi Event (Kabupaten/Kota) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <select
                  id="locationId"
                  name="locationId"
                  required
                  defaultValue={event.locationId}
                  disabled={anyLoading}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold appearance-none disabled:opacity-60"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="text-gray-900 dark:text-white">
                      {loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {state?.errors?.locationId && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.locationId[0]}
                </p>
              )}
            </div>

          </div>

          {/* Poster Image URL & Preview */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="poster" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Poster Event URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <input
                  type="url"
                  id="poster"
                  name="poster"
                  required
                  defaultValue={event.poster || ""}
                  disabled={anyLoading}
                  placeholder="https://images.unsplash.com/photo-..."
                  onChange={handlePosterChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold placeholder-gray-400 disabled:opacity-60"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Gunakan URL gambar Unsplash atau tautan gambar daring yang valid.
              </p>
              {state?.errors?.poster && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.poster[0]}
                </p>
              )}
            </div>

            {/* Premium Interactive Live Image Preview */}
            {showPreview && posterUrl && (
              <div className="rounded-2xl border border-gray-150 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900/60 p-4 flex flex-col sm:flex-row gap-4 items-center animate-fadeIn">
                <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden shadow-md border border-gray-200/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterUrl}
                    alt="Pratinjau poster"
                    onError={() => setShowPreview(false)}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 justify-center sm:justify-start">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Pratinjau Poster Terdeteksi!
                  </h4>
                  <p className="text-[11px] text-gray-400 max-w-sm">
                    Gambar di atas akan digunakan sebagai banner utama di halaman detail event budaya Anda.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Section 2: Jadwal & Waktu */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-500" />
              Tanggal & Waktu Pelaksanaan
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Atur tanggal pelaksanaan dan waktu mulai/selesai secara presisi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Start Date */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                defaultValue={formatDateToInput(event.startDate)}
                disabled={anyLoading}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold disabled:opacity-60"
              />
              {state?.errors?.startDate && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.startDate[0]}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                defaultValue={formatDateToInput(event.endDate)}
                disabled={anyLoading}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold disabled:opacity-60"
              />
              {state?.errors?.endDate && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.endDate[0]}
                </p>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label htmlFor="startTime" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Jam Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="startTime"
                name="startTime"
                required
                defaultValue={event.startTime}
                disabled={anyLoading}
                placeholder="18:00"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold placeholder-gray-400 disabled:opacity-60"
              />
              {state?.errors?.startTime && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.startTime[0]}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label htmlFor="endTime" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Jam Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="endTime"
                name="endTime"
                required
                defaultValue={event.endTime}
                disabled={anyLoading}
                placeholder="21:30"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold placeholder-gray-400 disabled:opacity-60"
              />
              {state?.errors?.endTime && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.endTime[0]}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Section 3: Tiket & Kuota */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-500" />
              Harga Tiket & Batasan Kuota
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Atur biaya pendaftaran (masukkan angka 0 jika gratis) dan kuota maksimum peserta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Harga Tiket (Rupiah) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <span className="text-sm font-bold">Rp</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  defaultValue={event.price}
                  disabled={anyLoading}
                  placeholder="0 (Isi 0 jika Gratis)"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold placeholder-gray-400 disabled:opacity-60"
                />
              </div>
              {state?.errors?.price && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.price[0]}
                </p>
              )}
            </div>

            {/* Quota */}
            <div className="space-y-2">
              <label htmlFor="quota" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Kuota Maksimal Peserta <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Users className="h-5 w-5" />
                </div>
                <input
                  type="number"
                  id="quota"
                  name="quota"
                  required
                  min="1"
                  defaultValue={event.quota}
                  disabled={anyLoading}
                  placeholder="Contoh: 100"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-semibold placeholder-gray-400 disabled:opacity-60"
                />
              </div>
              {state?.errors?.quota && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {state.errors.quota[0]}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Action Buttons: Delete on Left, Cancel + Save on Right */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Delete Button (Left side) */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={anyLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 active:bg-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl transition-all border border-red-200/20 disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Hapus Event
              </>
            )}
          </button>

          {/* Cancel & Submit Button (Right side) */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href="/dashboard/organizer"
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-all text-center cursor-pointer disabled:opacity-60"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={anyLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-500/10 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
