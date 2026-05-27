"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER", // USER or ORGANIZER
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validations
    if (!formData.name || !formData.email || !formData.password) {
      setError("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan registrasi.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-bali-sand dark:bg-[#121214]">
      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full max-w-7xl mx-auto px-4 py-8 lg:py-12 gap-8 items-center">
        
        {/* Left Column - Aesthetic Brand Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
          {/* Background image cover */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80')",
            }}
          />
          {/* Brand thematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark/95 via-primary/80 to-secondary/70 backdrop-blur-[1px]" />
          
          {/* Decorative Floating circles */}
          <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-xl" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-secondary-light/10 blur-xl" />

          {/* Left Block Header */}
          <div className="relative z-10 p-10">
            <Link href="/" className="flex items-center gap-2 text-white">
              <span className="text-2xl font-black tracking-tight">
                Bali<span className="text-accent">Event</span>
              </span>
            </Link>
          </div>

          {/* Left Block Center Content */}
          <div className="relative z-10 p-10 text-white space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              🌴 Keindahan Adat & Wisata Bali
            </span>
            <h2 className="text-4xl font-extrabold leading-tight">
              Eksplorasi & Lestarikan <br />
              Kebudayaan Bali Bersama Kami
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              Daftarkan diri Anda untuk menjelajahi ratusan agenda wisata budaya, lokakarya tradisional, festival kuliner, musik pantai, dan pameran kreatif di seluruh penjuru pulau Dewata.
            </p>
          </div>

          {/* Left Block Footer */}
          <div className="relative z-10 p-10 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <span>© 2026 BaliEvent Platform</span>
            <div className="flex gap-4">
              <span className="hover:text-white transition-colors cursor-pointer">Bantuan</span>
              <span className="hover:text-white transition-colors cursor-pointer">Kebijakan Privasi</span>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form Container */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-8 shadow-xl border border-gray-150/40 dark:border-gray-800/80 space-y-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Daftar <span className="text-gradient">Akun</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Buat akun BaliEvent baru untuk mulai menjelajahi event impian Anda.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Alert Feedback */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/30 flex gap-2 items-center">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/30 flex gap-2 items-center">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>Registrasi berhasil! Mengalihkan ke login...</span>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Role Select Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Daftar Sebagai
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-gray-700 dark:text-gray-300 cursor-pointer appearance-none"
                  >
                    <option value="USER">User Biasa (Menghadiri Event)</option>
                    <option value="ORGANIZER">Organizer (Penyelenggara Event)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading || success}
                className="w-full py-3.5 justify-center bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2 flex items-center gap-2"
              >
                {isLoading ? (
                  <span>Mendaftarkan...</span>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer switcher link */}
            <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                Masuk di sini
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
