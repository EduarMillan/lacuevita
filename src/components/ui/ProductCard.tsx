"use client";

import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useRouter } from "next/navigation";

export interface ProductCardProps {
  id: string;
  listingId?: string;
  title: string;
  price: string;
  location: string;
  time: string;
  image?: string;
  icon?: string;
  description?: string;
  badges?: Array<{ label: string; variant: "verified" | "featured" }>;
  compact?: boolean;
  viewCount?: number;
}

function FavoriteButton({ listingId }: { listingId: string }) {
  const { favoriteIds, toggleFavorite, isLoaded } = useFavorites();
  const router = useRouter();
  const isFavorited = favoriteIds.has(listingId);

  if (!isLoaded) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavorite(listingId);
    if (result === null) {
      router.push("/auth/login");
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 p-2 sm:p-1.5 rounded-full shadow-md transition-all duration-200 active:scale-90 ${
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/80 backdrop-blur text-on-surface-variant hover:bg-white hover:text-red-500"
      }`}
      aria-label={isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <span
        className="material-symbols-outlined text-xl"
        style={{ fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}` }}
      >
        favorite
      </span>
    </button>
  );
}

export default function ProductCard({
  id,
  listingId,
  title,
  price,
  location,
  time,
  image,
  icon,
  description,
  badges = [],
  compact = false,
  viewCount,
}: ProductCardProps) {
  const isFeatured = badges.some((b) => b.variant === "featured");

  if (compact) {
    return (
      <Link
        href={`/anuncio/${id}`}
        className="bg-surface-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow block"
      >
        <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-surface-low relative">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
                {icon || "image"}
              </span>
            </div>
          )}
          {listingId && <FavoriteButton listingId={listingId} />}
        </div>
        <h5 className="font-bold text-sm line-clamp-1">{title}</h5>
        <div className="flex items-center justify-between mt-1">
          <p className="text-primary font-extrabold">{price}</p>
          {viewCount != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                visibility
              </span>
              {viewCount}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/anuncio/${id}`}
      className={`group relative flex flex-col bg-surface-lowest rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl ${
        isFeatured
          ? "border-2 border-amber-300 shadow-[0_0_20px_-4px_rgba(245,158,11,0.25)] ring-1 ring-amber-200/50"
          : "border border-transparent hover:border-teal-100"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
              {icon || "image"}
            </span>
          </div>
        )}

        {listingId && <FavoriteButton listingId={listingId} />}

        {badges.length > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-lg ${
                  badge.variant === "verified"
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950"
                }`}
              >
                {badge.variant === "featured" && (
                  <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>star</span>
                )}
                <span className="hidden sm:inline">{badge.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className="text-xs sm:text-base font-bold text-on-surface leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium whitespace-nowrap ml-1.5 sm:ml-2">
            {time}
          </span>
        </div>
        {description && (
          <p className="text-[11px] sm:text-sm text-on-surface-variant line-clamp-2 mb-2 sm:mb-4 hidden sm:block">
            {description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm sm:text-xl font-black text-primary">{price}</span>
          <div className="flex items-center gap-2 sm:gap-3">
            {viewCount != null && (
              <span className="flex items-center gap-0.5 text-[9px] sm:text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-xs sm:text-sm">
                  visibility
                </span>
                {viewCount}
              </span>
            )}
            <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-xs sm:text-sm">
                location_on
              </span>
              <span className="truncate max-w-[60px] sm:max-w-none">{location}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
