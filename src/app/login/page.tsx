"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Key,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Sometime NextAuth passes errors via query string (e.g. ?error=CredentialsSignin)
  const authError = searchParams.get("error");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [error, setError] = useState<string | null>(
    authError === "CredentialsSignin"
      ? "Email atau password salah. Silakan periksa kembali."
      : authError
      ? "Terjadi masalah autentikasi. Silakan masuk lagi."
      : null
  );
  
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Email dan password wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (res?.error) {
        setError("Email atau password yang Anda masukkan salah.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      // Wait a tiny bit for a nice visual success transition, then head to dashboard route!
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError("Gagal masuk. Silakan coba lagi nanti.");
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
                "url('https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=800&q=80')",
            }}
          />
          {/* Brand thematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary-dark/95 via-secondary/80 to-primary/70 backdrop-blur-[1px]" />
          
          {/* Decorative Floating circles */}
          <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-xl" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary-light/10 blur-xl" />

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
              🎭 Seni Tari & Panggung Tradisional
            </span>
            <h2 className="text-4xl font-extrabold leading-tight">
              Selamat Datang Kembali <br />
              di Portal Event Terbesar Bali
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              Masuk ke akun Anda untuk memesan tiket pertunjukan, mendaftar lokakarya adat, mengulas event budaya yang telah dihadiri, atau mengelola event yang Anda selenggarakan.
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

        {/* Right Column - Login Form Container */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-white dark:bg-[#1c1c21] rounded-3xl p-8 shadow-xl border border-gray-150/40 dark:border-gray-800/80 space-y-8 relative overflow-hidden">
            
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Masuk <span className="text-gradient">Akun</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Silakan masuk untuk melanjutkan aktivitas Anda di BaliEvent.
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
                  <span>Autentikasi berhasil! Mengalihkan...</span>
                </div>
              )}

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
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">Lupa Sandi?</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password Anda"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Remember Session Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  defaultChecked
                />
                <label htmlFor="remember" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer font-medium">
                  Biarkan saya tetap masuk di perangkat ini
                </label>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading || success}
                className="w-full py-3.5 justify-center bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-2 flex items-center gap-2"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    Masuk Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Switcher Footer */}
            <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Belum terdaftar?{" "}
              <Link
                href="/register"
                className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-bali-sand dark:bg-[#121214]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Memuat halaman masuk...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
