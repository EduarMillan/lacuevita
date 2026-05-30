"use client";

import Link from "next/link";
import Image from "next/image";

interface AdultListingCardProps {
  slug: string;
  alias: string;
  title: string;
  serviceType: string;
  location: string;
  viewCount: number;
  isFeatured: boolean;
  presentationImage: string | null;
}

export default function AdultListingCard({
  slug,
  alias,
  title,
  serviceType,
  location,
  viewCount,
  isFeatured,
  presentationImage,
}: AdultListingCardProps) {
  return (
    <Link
      href={`/adultos/${slug}`}
      className={`group block bg-surface-lowest rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isFeatured ? "border-rose-300 shadow-md" : "border-transparent"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-low">
        {presentationImage ? (
          <Image
            src={presentationImage}
            alt={alias}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/15">
              person
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFeatured && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>star</span>
              Destacado
            </span>
          )}
        </div>

        {/* Service type badge */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {serviceType}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-sm text-on-surface mb-0.5 line-clamp-1">
          {title}
        </h3>
        <p className="text-xs font-semibold text-rose-600 mb-1">{alias}</p>
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-on-surface-variant">
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {location}
          </span>
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">visibility</span>
            {viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
