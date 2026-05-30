"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/format";

interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  currency?: string;
  location: string;
  isFeatured: boolean;
  createdAt: string;
  images: { url: string }[];
  category: { name: string; slug: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

export default function MyFavorites() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchFavorites = useCallback(async (page = 1) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/favoritos/listings?page=${page}&limit=12`);
      if (res.status === 401) {
        setError(true);
        return;
      }
      const data = await res.json();
      setListings(data.listings);
      setPagination(data.pagination);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {error ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
            lock
          </span>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            Inicia sesión para ver tus favoritos
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Necesitas una cuenta para guardar anuncios.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg"
          >
            Iniciar Sesión
          </Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-lowest rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-surface-container" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-surface-container rounded-lg w-3/4" />
                <div className="h-5 bg-surface-container rounded-lg w-1/2" />
                <div className="h-3 bg-surface-container rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <span
            className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            No tienes favoritos guardados
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Explora anuncios y toca el corazón para guardarlos aquí.
          </p>
          <Link
            href="/busqueda"
            className="inline-flex bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg"
          >
            Explorar Anuncios
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                id={listing.slug}
                listingId={listing.id}
                title={listing.title}
                price={formatPrice(listing.price as unknown as number, listing.currency as "CUP" | "USD" | "MLC" | undefined)}
                location={listing.location}
                time={timeAgo(listing.createdAt)}
                image={listing.images[0]?.url}
                description={listing.description}
                badges={
                  listing.isFeatured
                    ? [{ label: "Destacado", variant: "featured" as const }]
                    : []
                }
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchFavorites(i + 1)}
                  className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                    pagination.page === i + 1
                      ? "bg-primary text-on-primary shadow-lg"
                      : "bg-surface-lowest text-on-surface-variant hover:bg-surface-low"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
