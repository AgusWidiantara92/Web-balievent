"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import type { EventCardData, FilterOption } from "@/app/events/page";

const EVENTS_PER_PAGE = 6;

interface EventsContentProps {
  events: EventCardData[];
  categories: FilterOption[];
  locations: FilterOption[];
}

export function EventsContent({
  events,
  categories,
  locations,
}: EventsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        searchQuery === "" ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "" ||
        evt.category.slug === selectedCategory ||
        evt.category.id === selectedCategory;

      const matchesLocation =
        selectedLocation === "" ||
        evt.location.id === selectedLocation ||
        evt.location.name.toLowerCase() === selectedLocation.toLowerCase();

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [events, searchQuery, selectedCategory, selectedLocation]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };
  const handleLocationChange = (val: string) => {
    setSelectedLocation(val);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedCategory !== "" || selectedLocation !== "";

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

  // Reusable filter panel (used in both desktop sidebar and mobile drawer)
  const filterPanel = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Cari Event
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nama event..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Kategori
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug ?? cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Kabupaten / Kota
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="">Semua Lokasi</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center text-sm text-primary hover:text-primary-dark transition-colors font-medium w-full justify-center py-2 rounded-xl border border-primary/20 hover:bg-primary/5"
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
        <div className="sticky top-24 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-white dark:bg-[#121214] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
            Filter Event
          </h3>
          {filterPanel}
        </div>
      </aside>

      {/* ===== Mobile Filter Toggle ===== */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showMobileFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-white text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
              !
            </span>
          )}
        </button>
        {showMobileFilters && (
          <div className="mt-4 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-white dark:bg-[#121214] shadow-sm">
            {filterPanel}
          </div>
        )}
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-1 min-w-0">
        {/* Results info bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {filteredEvents.length}
            </span>{" "}
            event
            {hasActiveFilters && " (difilter)"}
          </p>
        </div>

        {/* Event Cards Grid */}
        {paginatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedEvents.map((evt) => (
              <div
                key={evt.id}
                className="group flex flex-col bg-white dark:bg-[#121214] rounded-2xl border border-gray-200/60 dark:border-gray-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Poster */}
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-bali-charcoal/90 backdrop-blur-sm text-xs font-bold text-primary px-3 py-1 rounded-full border border-orange-100 dark:border-orange-950">
                    {evt.category.name}
                  </div>
                  {evt.price === 0 && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-xs font-bold text-white px-3 py-1 rounded-full">
                      Gratis
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5 text-primary" />
                        {formatDate(evt.startDate)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3.5 w-3.5 text-secondary" />
                        {evt.location.name}
                      </span>
                      <span className="flex items-center">
                        <Users className="mr-1 h-3.5 w-3.5 text-accent" />
                        {evt.quota} kursi
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {evt.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Footer: Price + CTA */}
                  <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block">
                        Harga Tiket
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {formatPrice(evt.price)}
                      </span>
                    </div>
                    <Link href={`/events/${evt.slug}`}>
                      <Button variant="primary" size="sm">
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-5 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Event Tidak Ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Tidak ada event yang cocok dengan filter Anda. Coba ubah kata
              kunci, kategori, atau lokasi pencarian.
            </p>
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Hapus semua filter →
            </button>
          </div>
        )}

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-xl text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white shadow-sm"
                      : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c21] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
