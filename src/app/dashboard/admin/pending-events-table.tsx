"use client";

import React, { useTransition, useState } from "react";
import Link from "next/link";
import { approveEventAction, rejectEventAction } from "./actions";
import {
  Calendar,
  Tag,
  MapPin,
  Eye,
  Check,
  X,
  User,
  AlertCircle,
  Inbox,
} from "lucide-react";

interface Organizer {
  name: string | null;
  email: string;
}

interface Category {
  name: string;
}

interface Location {
  name: string;
  city: string;
}

interface PendingEvent {
  id: string;
  title: string;
  slug: string;
  poster: string | null;
  startDate: Date;
  organizer: Organizer;
  category: Category;
  location: Location;
}

interface PendingEventsTableProps {
  events: PendingEvent[];
}

export function PendingEventsTable({ events }: PendingEventsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Formatting date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  // Approve Event Handler
  const handleApprove = (eventId: string, eventTitle: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menyetujui event "${eventTitle}"?\nEvent akan dipublikasikan ke publik.`
    );
    
    if (!confirmed) return;

    setFeedback(null);
    setActiveEventId(eventId);

    startTransition(async () => {
      try {
        const result = await approveEventAction(eventId);
        if (result.success) {
          setFeedback({ type: "success", message: result.message || "Event berhasil disetujui." });
        } else {
          setFeedback({ type: "error", message: result.message || "Gagal menyetujui event." });
        }
      } catch (error: any) {
        setFeedback({ type: "error", message: error.message || "Terjadi kesalahan sistem." });
      } finally {
        setActiveEventId(null);
      }
    });
  };

  // Reject Event Handler
  const handleReject = (eventId: string, eventTitle: string) => {
    let reason = "";
    let isValid = false;

    while (!isValid) {
      const input = window.prompt(
        `Masukkan alasan penolakan untuk event "${eventTitle}" (Wajib diisi):`,
        "Informasi kurang lengkap atau gambar poster tidak valid."
      );

      // If user clicked Cancel in prompt, abort the reject operation
      if (input === null) return;

      if (input.trim() === "") {
        window.alert("Alasan penolakan wajib diisi!");
      } else {
        reason = input;
        isValid = true;
      }
    }

    setFeedback(null);
    setActiveEventId(eventId);

    startTransition(async () => {
      try {
        const result = await rejectEventAction(eventId, reason);
        if (result.success) {
          setFeedback({ type: "success", message: result.message || "Event berhasil ditolak." });
        } else {
          setFeedback({ type: "error", message: result.message || "Gagal menolak event." });
        }
      } catch (error: any) {
        setFeedback({ type: "error", message: error.message || "Terjadi kesalahan sistem." });
      } finally {
        setActiveEventId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Alert Message Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm font-semibold transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
              : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30"
          }`}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{feedback.message}</p>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#1c1c21] rounded-3xl shadow-md border border-gray-150/40 dark:border-gray-800/80 overflow-hidden">
        
        {/* Table Header Description */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/60 flex justify-between items-center bg-white dark:bg-[#1c1c21]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Event Menunggu Persetujuan
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Tinjau, setujui, atau tolak pendaftaran event budaya dan wisata dari penyelenggara.
            </p>
          </div>
          <span className="bg-amber-100/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-xs px-3 py-1.5 rounded-full border border-amber-200/20">
            {events.length} Pending
          </span>
        </div>

        {events.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center space-y-4 bg-white dark:bg-[#1c1c21]">
            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 w-16 h-16 flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800">
              <Inbox className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-bold text-gray-800 dark:text-gray-200">Semua Event Bersih!</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Tidak ada event dengan status PENDING saat ini. Semua pendaftaran telah dimoderasi.
              </p>
            </div>
          </div>
        ) : (
          /* Table Content */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800/60 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-4">Penyelenggara</th>
                  <th className="py-4 px-4">Kategori & Lokasi</th>
                  <th className="py-4 px-4">Tanggal Mulai</th>
                  <th className="py-4 px-6 text-right">Moderasi Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40 text-sm bg-white dark:bg-[#1c1c21]">
                {events.map((event) => {
                  const isLoadingThis = isPending && activeEventId === event.id;

                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-all group"
                    >
                      {/* Column 1: Event Poster & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {event.poster ? (
                            <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-150/40 dark:border-gray-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={event.poster}
                                alt={event.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-150/40 dark:border-gray-800">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="max-w-[200px] sm:max-w-[260px] truncate">
                            <p className="font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {event.title}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                              ID: {event.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Organizer */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 max-w-[180px]">
                          <p className="font-semibold text-gray-700 dark:text-gray-300 truncate flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {event.organizer.name || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate pl-5">
                            {event.organizer.email}
                          </p>
                        </div>
                      </td>

                      {/* Column 3: Category & Location */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded-full border border-teal-100/50 dark:border-teal-900/30">
                            <Tag className="h-3 w-3" />
                            {event.category.name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            {event.location.name} ({event.location.city})
                          </p>
                        </div>
                      </td>

                      {/* Column 4: Date */}
                      <td className="py-4 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {formatDate(event.startDate)}
                      </td>

                      {/* Column 5: Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Detail Button */}
                          <Link
                            href={`/events/${event.slug}`}
                            className="p-2 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 dark:bg-gray-900 dark:hover:bg-teal-950/30 dark:hover:text-teal-400 rounded-lg text-gray-400 transition-colors border border-transparent hover:border-teal-100 dark:hover:border-teal-900/30"
                            title="Tinjau Detail Publik"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Approve Button */}
                          <button
                            onClick={() => handleApprove(event.id, event.title)}
                            disabled={isPending}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-400 rounded-lg text-emerald-600 transition-colors border border-transparent hover:border-emerald-200/30 disabled:opacity-50 cursor-pointer"
                            title="Setujui Event (Approve)"
                          >
                            {isLoadingThis ? (
                              <svg className="animate-spin h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => handleReject(event.id, event.title)}
                            disabled={isPending}
                            className="p-2 bg-red-50 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/40 dark:hover:text-red-400 rounded-lg text-red-600 transition-colors border border-transparent hover:border-red-200/30 disabled:opacity-50 cursor-pointer"
                            title="Tolak Event (Reject)"
                          >
                            {isLoadingThis ? (
                              <svg className="animate-spin h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <X className="h-4 w-4" />
                            )}
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
  );
}
