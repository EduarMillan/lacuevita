"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { categories as allCategories } from "@/lib/categories";
import { regions } from "@/lib/regions";

const PAGE_SIZE = 8;

interface ListingResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  currency?: string;
  location: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  images: { url: string }[];
  category: { name: string; slug: string };
}

import { formatPrice } from "@/lib/format";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months > 1 ? "es" : ""}`;
}

export default function BusquedaPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const regionId = searchParams.get("region");
  const comunaId = searchParams.get("comuna");

  const [listings, setListings] = useState<ListingResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("recent");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Resolve location display
  const selectedRegion = regionId
    ? regions.find((r) => r.id === regionId)
    : null;
  const selectedComuna =
    selectedRegion && comunaId
      ? selectedRegion.comunas.find((c) => c.id === comunaId)
      : null;

  const locationDisplay = selectedComuna
    ? `${selectedComuna.name}, ${selectedRegion!.shortName}`
    : selectedRegion
      ? selectedRegion.name
      : "Toda Cuba";

  // Build the location filter string for the API
  const locationFilter = selectedComuna
    ? selectedComuna.name
    : selectedRegion
      ? selectedRegion.shortName
      : "";

  const fetchListings = useCallback(
    async (pageNum: number) => {
      setLoading(true);

      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (locationFilter) params.set("location", locationFilter);
      params.set("sort", sort);
      params.set("page", pageNum.toString());
      params.set("limit", PAGE_SIZE.toString());

      try {
        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();
        setListings(data.listings);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [query, locationFilter, sort]
  );

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === page) return;
    fetchListings(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Build pagination numbers: show max 7 pages with ellipsis
  function getPaginationNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const searchTitle = query
    ? `Resultados para "${query}"`
    : "Todos los anuncios";

  return (
    <div className="min-h-screen flex">
      {/* Mobile filter toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-br from-primary to-primary-container text-on-primary p-4 rounded-full shadow-xl active:scale-95 transition-transform"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        <span className="material-symbols-outlined">
          {mobileSidebarOpen ? "close" : "tune"}
        </span>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-[72px] left-0 h-[calc(100vh-72px)] w-72 flex flex-col p-6 space-y-8
          bg-surface-low/80 backdrop-blur-lg overflow-y-auto z-30
          transition-transform duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Categories */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-secondary font-bold mb-4">
            Categorías
          </h2>
          <div className="space-y-1">
            {allCategories.map((cat) => (
              <a
                key={cat.slug}
                href={`/categorias/${cat.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-transform hover:translate-x-1 text-on-surface-variant hover:bg-surface-lowest"
              >
                <span className="material-symbols-outlined text-sm">
                  {cat.icon}
                </span>
                <span className="font-medium text-sm">{cat.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Location from search */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-secondary font-bold">
            Ubicación
          </h2>
          <div className="flex items-center gap-2 bg-surface-lowest rounded-lg p-2.5">
            <span className="material-symbols-outlined text-primary text-lg">
              location_on
            </span>
            <span className="text-sm text-on-surface">{locationDisplay}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="mb-2">
              <Breadcrumbs
                items={[
                  { label: "Inicio", href: "/" },
                  { label: "Búsqueda" },
                ]}
              />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
              {searchTitle}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-on-surface-variant">
                {total} resultado{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
              </p>
              {(selectedRegion || selectedComuna) && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  {locationDisplay}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex bg-surface-low p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-surface-lowest shadow-sm text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-surface-lowest shadow-sm text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
            {/* Sort */}
            <select
              className="bg-surface-lowest rounded-xl text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium border-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="most_viewed">Más vistos</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              progress_activity
            </span>
          </div>
        ) : listings.length > 0 ? (
          <>
            {/* Product grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                  : "flex flex-col gap-4"
              }
            >
              {listings.map((listing) => (
                <ProductCard
                  key={listing.id}
                  id={listing.slug}
                  listingId={listing.id}
                  title={listing.title}
                  price={formatPrice(listing.price, listing.currency as "CUP" | "USD" | "MLC" | undefined)}
                  location={listing.location}
                  time={timeAgo(listing.createdAt)}
                  image={listing.images[0]?.url}
                  description={listing.description}
                  viewCount={listing.viewCount}
                  badges={listing.isFeatured ? [{ label: "Destacado", variant: "featured" as const }] : []}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-12 flex justify-center">
                <nav className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      chevron_left
                    </span>
                  </button>

                  {/* Page numbers */}
                  {getPaginationNumbers().map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`dots-${i}`}
                        className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                          p === page
                            ? "bg-primary text-on-primary shadow-md"
                            : "text-on-surface-variant hover:bg-surface-low"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      chevron_right
                    </span>
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
              search_off
            </span>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-on-surface-variant">
              Intenta con otros términos de búsqueda o cambia la ubicación.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
