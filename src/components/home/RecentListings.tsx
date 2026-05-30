"use client";

import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/format";

interface ListingData {
  id: string;
  slug: string;
  title: string;
  price: string | number;
  currency?: string;
  location: string;
  viewCount: number;
  isFeatured: boolean;
  description: string;
  createdAt: string;
  images: { url: string }[];
}

const PAGE_SIZE = 40;

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

export default function RecentListings({
  initialListings,
  totalCount,
}: {
  initialListings: ListingData[];
  totalCount: number;
}) {
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const hasMore = listings.length < totalCount;

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/listings?page=${nextPage}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      setListings((prev) => [...prev, ...data.listings]);
      setPage(nextPage);
    } catch {
      console.error("Error loading more listings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
            viewCount={listing.viewCount}
            badges={
              listing.isFeatured
                ? [{ label: "Destacado", variant: "featured" as const }]
                : []
            }
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 sm:mt-16 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-surface-highest text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Cargando...
              </span>
            ) : (
              "Ver más anuncios"
            )}
          </button>
        </div>
      )}
    </>
  );
}
