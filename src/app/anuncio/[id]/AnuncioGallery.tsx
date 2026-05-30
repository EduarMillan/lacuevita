"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export default function AnuncioGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-low flex items-center justify-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant/20">
          image
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-low relative group">
        <Image
          src={images[activeIndex].url}
          alt={`${title} - Foto ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-contain bg-surface-container"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square rounded-lg overflow-hidden relative ${
                i === activeIndex
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100 transition-opacity"
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} - Miniatura ${i + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
