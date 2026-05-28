"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  Tag,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import type { EventCardData, FilterOption } from "@/app/events/page";

interface EventsContentProps {
  events: EventCardData[];
  categories: FilterOption[];
  locations: FilterOption[];
  totalEvents: number;
  currentPage: number;
  totalPages: number;
  activeFilters: {
    q: string;
    category: string;
    location: string;
    priceType: string;
    sortBy: string;
  };
}

export function EventsContent({
  events,
  categories,
  locations,
  totalEvents,
  currentPage,
  totalPages,
  activeFilters,
}: EventsContentProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(activeFilters.q);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Synchronize local input state with query params when they change externally
  useEffect(() => {
    setSearchInput(activeFilters.q);
  }, [activeFilters.q]);

  // Debounce search query to avoid triggering router pushes on every single keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput !== activeFilters.q) {
        const params = new URLSearchParams(window.location.search);
        if (searchInput.trim()) {
          params.set("q", searchInput.trim());
        } else {
          params.delete("q");
        }
        params.delete("page"); // Reset to page 1
        router.push(`/events?${params.toString()}`);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, activeFilters.q, router]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/events?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/events?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput("");
    router.push("/events");
  };

  const hasActiveFilters =
    activeFilters.q !== "" ||
    activeFilters.category !== "" ||
    activeFilters.location !== "" ||
    activeFilters.priceType !== "" ||
    activeFilters.sortBy !== "terdekat";

  // Formatter utilities
  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  // Reusable Filter Panel layout (used for both desktop sidebar and mobile overlay)
  const filterPanel = (
    <div className="space-y-6 text-left">
      {/* 1. Search Bar */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Cari Kata Kunci
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-450 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari judul event..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* 2. Category Dropdown */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          <Tag className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-primary" />
          Kategori Event
        </label>
        <select
          value={activeFilters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug ?? cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Location Dropdown */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          <MapPin className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-secondary" />
          Kabupaten / Kota
        </label>
        <select
          value={activeFilters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
        >
          <option value="">Semua Lokasi</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Ticket Pricing Filter */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          <DollarSign className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-emerald-600 dark:text-emerald-400" />
          Tipe Tiket
        </label>
        <select
          value={activeFilters.priceType}
          onChange={(e) => handleFilterChange("priceType", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
        >
          <option value="">Semua Harga</option>
          <option value="gratis">Gratis</option>
          <option value="berbayar">Berbayar</option>
        </select>
      </div>

      {/* 5. Sorting Dropdown */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          <ArrowUpDown className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-blue-600 dark:text-blue-400" />
          Urutkan Berdasarkan
        </label>
        <select
          value={activeFilters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
        >
          <option value="terdekat">Terdekat (Tanggal Mulai)</option>
          <option value="terbaru">Terbaru Diunggah</option>
          <option value="termurah">Harga Termurah</option>
        </select>
      </div>

      {/* 6. Clear Filters Action */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex items-center text-sm text-primary hover:text-primary-dark transition-colors font-bold w-full justify-center py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 cursor-pointer"
        >
          <X className="h-4 w-4 mr-1.5" />
          Hapus Semua Filter
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ===== Desktop Sidebar Filters ===== */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 p-6 rounded-3xl border border-gray-150/40 dark:border-gray-800/80 bg-white dark:bg-[#1c1c21] shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
            Filter Event
          </h3>
          {filterPanel}
        </div>
      </aside>

      {/* ===== Mobile Filter Panel Toggle ===== */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showMobileFilters ? "Sembunyikan Panel Filter" : "Tampilkan Panel Filter"}
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-white text-[10px] rounded-full h-5 w-5 inline-flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
        {showMobileFilters && (
          <div className="mt-4 p-6 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 bg-white dark:bg-[#1c1c21] shadow-lg">
            {filterPanel}
          </div>
        )}
      </div>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 min-w-0">
        
        {/* Results Bar info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalEvents}</span>{" "}
            event budaya terdaftar
            {hasActiveFilters && " (hasil filter)"}
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group flex flex-col bg-white dark:bg-[#1c1c21] rounded-2xl border border-gray-150/40 dark:border-gray-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
              >
                {/* Poster image container */}
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover transition-transform duration-505 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-bali-charcoal/90 backdrop-blur-sm text-[10px] font-bold text-primary px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-950/20">
                    {evt.category.name}
                  </div>
                  {evt.price === 0 && (
                    <div className="absolute top-3 right-3 bg-emerald-550/90 dark:bg-emerald-950/90 backdrop-blur-sm text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 px-2.5 py-1 rounded-full">
                      Gratis
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      <span className="flex items-center">
                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        {formatDate(evt.startDate)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="mr-1.5 h-3.5 w-3.5 text-secondary" />
                        {evt.location.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {evt.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                      {evt.description}
                    </p>
                  </div>

                  {/* Footer billing & link CTA */}
                  <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-semibold">Harga Tiket</span>
                      <span className="font-extrabold text-primary text-base">
                        {formatPrice(evt.price)}
                      </span>
                    </div>
                    <Link href={`/events/${evt.slug}`}>
                      <Button variant="primary" size="sm" className="font-bold cursor-pointer">
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state - Beautiful and Clean */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#1c1c21] rounded-3xl border border-gray-150/45 dark:border-gray-800/80 shadow-md max-w-xl mx-auto space-y-5">
            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-250">
                Event Tidak Ditemukan
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                Tidak ada event budaya yang cocok dengan pencarian atau kriteria filter Anda saat ini. Coba bersihkan atau ganti kriteria pencarian Anda.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors py-2 px-6 rounded-xl border border-primary/20 hover:bg-primary/5 cursor-pointer"
            >
              Hapus Semua Filter →
            </button>
          </div>
        )}

        {/* ===== Dynamic Server Pagination ===== */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {/* Previous page button */}
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-gray-650 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer h-10 w-10 flex items-center justify-center"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page indices */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-10 w-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next page button */}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1c1c21] text-gray-650 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer h-10 w-10 flex items-center justify-center"
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
