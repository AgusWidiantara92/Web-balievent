"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { registerForEventAction } from "@/app/events/[slug]/actions";
import {
  Ticket,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";

interface RegistrationFormProps {
  eventId: string;
  eventPrice: number;
  remainingQuota: number;
  isAlreadyRegistered: boolean;
  isLoggedIn: boolean;
  slug: string;
}

export function RegistrationForm({
  eventId,
  eventPrice,
  remainingQuota,
  isAlreadyRegistered,
  isLoggedIn,
  slug,
}: RegistrationFormProps) {
  const router = useRouter();
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Price formatting helper
  const formatPrice = (priceVal: number) => {
    if (priceVal === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(priceVal);
  };

  const handleIncrement = () => {
    if (ticketQuantity < remainingQuota) {
      setTicketQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await registerForEventAction(eventId, ticketQuantity, notes);
      
      if (response.success) {
        setSuccess(response.message || "Pendaftaran berhasil!");
        
        // Short delay for a smoother user experience, then redirect
        setTimeout(() => {
          router.push("/dashboard/user/tickets");
          router.refresh();
        }, 1500);
      } else {
        setError(response.message || "Pendaftaran gagal.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan internal.");
      setLoading(false);
    }
  };

  // Case 1: User is already registered for this event
  if (isAlreadyRegistered) {
    return (
      <div className="space-y-4 text-center p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
        <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 gap-2 font-bold text-sm">
          <CheckCircle2 className="h-5 w-5" />
          <span>Anda Sudah Terdaftar</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
          Anda telah terdaftar di event budaya ini. Silakan kunjungi dasbor tiket Anda untuk melihat tiket masuk & kode QR.
        </p>
        <Link href="/dashboard/user/tickets" className="block w-full">
          <Button variant="outline" size="sm" className="w-full">
            Lihat Tiket Saya
          </Button>
        </Link>
      </div>
    );
  }

  // Case 2: User is not logged in
  if (!isLoggedIn) {
    return (
      <div className="space-y-4 text-center p-4 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/20 rounded-xl">
        <div className="flex items-center justify-center text-primary gap-1.5 font-bold text-sm">
          <Lock className="h-4 w-4" />
          <span>Registrasi Terkunci</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
          Anda harus masuk (login) menggunakan akun pengunjung terlebih dahulu untuk melakukan pendaftaran tiket event.
        </p>
        <Link href={`/login?callbackUrl=/events/${slug}`} className="block w-full">
          <Button variant="primary" size="sm" className="w-full">
            Login untuk Mendaftar
          </Button>
        </Link>
      </div>
    );
  }

  // Case 3: Quota is fully booked
  if (remainingQuota <= 0) {
    return (
      <div className="space-y-3 text-center p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
        <div className="flex items-center justify-center text-red-600 dark:text-red-400 gap-1.5 font-bold text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Kuota Habis</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
          Pendaftaran ditutup karena seluruh kuota tiket event ini telah terisi sepenuhnya.
        </p>
        <Button variant="primary" className="w-full cursor-not-allowed opacity-50" disabled>
          Kuota Penuh
        </Button>
      </div>
    );
  }

  const totalPrice = ticketQuantity * eventPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      
      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex gap-2 items-start">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Ticket Quantity Selector */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Jumlah Tiket
          </label>
          <span className="text-[10px] font-semibold text-gray-400">
            Sisa Kuota: {remainingQuota} tiket
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={ticketQuantity <= 1 || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 disabled:pointer-events-none text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <div className="flex-1 h-10 flex items-center justify-center font-bold text-gray-800 dark:text-gray-150 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-150 dark:border-gray-800">
            {ticketQuantity}
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={ticketQuantity >= remainingQuota || loading}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 disabled:pointer-events-none text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notes Form Control */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Catatan Pendaftaran (Opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Datang bersama rombongan keluarga, butuh akses kursi roda, dll."
          rows={2}
          disabled={loading}
          className="w-full text-xs p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
        />
      </div>

      {/* Real-time Pricing Info */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-bali-sand dark:from-[#221c17] dark:to-[#1a1c21] border border-orange-100/50 dark:border-orange-900/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Harga</p>
            <p className="text-xs text-gray-400 mt-0.5">{ticketQuantity} x {formatPrice(eventPrice)}</p>
          </div>
          <span className="text-2xl font-extrabold text-gradient">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full justify-center py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <Ticket className="h-5 w-5 mr-2" />
            Daftar Event
          </>
        )}
      </Button>
    </form>
  );
}
