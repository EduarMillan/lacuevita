"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AgeGate from "@/components/adultos/AgeGate";
import AdultListingCard from "@/components/adultos/AdultListingCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const PAGE_SIZE = 20;

interface AdultListingData {
  id: string;
  slug: string;
  alias: string;
  title: string;
  serviceType: string;
  location: string;
  viewCount: number;
  isFeatured: boolean;
  presentationImage: string | null;
  createdAt: string;
}

const SERVICE_TYPES = [
  "Todos",
  "Masajes",
  "Compañía",
  "Entretenimiento",
  "Shows",
  "Fotografía",
  "Otro",
];

export default function AdultosPage() {
  const [listings, setListings] = useState<AdultListingData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const fetchListings = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", PAGE_SIZE.toString());
      if (search) params.set("q", search);
      if (serviceFilter) params.set("serviceType", serviceFilter);

      const res = await fetch(`/api/adultos?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
      setPage(pageNum);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, serviceFilter]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <AgeGate>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
          </div>
          <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto relative z-10">
            <Breadcrumbs
              variant="light"
              items={[
                { label: "Inicio", href: "/" },
                { label: "Adultos" },
              ]}
            />
            <div className="mt-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-3">
                <span className="material-symbols-outlined text-white/80 text-lg">18_up_rating</span>
                <span className="text-sm font-semibold text-white/90 tracking-wide">
                  Sección exclusiva +18
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                Servicios Personales
              </h1>
              <p className="text-sm text-white/70 max-w-lg">
                Directorio privado de servicios para adultos. Contacto seguro y anónimo.
              </p>
              <Link
                href="/adultos/publicar"
                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-600 transition-colors mt-4 shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Publicar Anuncio
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search & filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por título o alias..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Service type filter */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {SERVICE_TYPES.map((type) => {
              const value = type === "Todos" ? "" : type;
              return (
                <button
                  key={type}
                  onClick={() => setServiceFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    serviceFilter === value
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-surface-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <p className="text-sm text-on-surface-variant mb-6">
            {total} anuncio{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-rose-400 animate-spin">
                progress_activity
              </span>
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {listings.map((listing) => (
                  <AdultListingCard
                    key={listing.id}
                    slug={listing.slug}
                    alias={listing.alias}
                    title={listing.title}
                    serviceType={listing.serviceType}
                    location={listing.location}
                    viewCount={listing.viewCount}
                    isFeatured={listing.isFeatured}
                    presentationImage={listing.presentationImage}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="py-12 flex justify-center">
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => { fetchListings(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === 1}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => { fetchListings(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                          p === page
                            ? "bg-rose-600 text-white shadow-md"
                            : "text-on-surface-variant hover:bg-surface-low"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => { fetchListings(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
                search_off
              </span>
              <h3 className="text-lg font-bold text-on-surface mb-2">
                No hay anuncios disponibles
              </h3>
              <p className="text-on-surface-variant text-sm">
                Sé el primero en publicar en esta sección.
              </p>
            </div>
          )}
        </div>
      </div>
    </AgeGate>
  );
}
