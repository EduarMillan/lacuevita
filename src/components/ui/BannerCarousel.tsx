"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Banner {
  id: string;
  businessName: string;
  imageUrl: string;
  linkUrl: string | null;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.banners?.length) setBanners(data.banners); })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, paused, next]);

  function handleClick(banner: Banner) {
    fetch("/api/banners/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: banner.id }),
    }).catch(() => {});
  }

  if (banners.length === 0) return null;

  const banner = banners[current];

  function ensureProtocol(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[3/1] lg:aspect-[2.5/1]">
        {banner.linkUrl ? (
          <a
            href={ensureProtocol(banner.linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(banner)}
            className="block w-full h-full"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.businessName}
              fill
              sizes="100vw"
              className="object-contain transition-opacity duration-500"
            />
          </a>
        ) : (
          <Image
            src={banner.imageUrl}
            alt={banner.businessName}
            fill
            sizes="100vw"
            className="object-contain transition-opacity duration-500"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {banner.businessName}
          </span>
          <span className="text-[9px] text-white/50 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            Publicidad
          </span>
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all hover:opacity-100"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all hover:opacity-100"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
            </button>
          </>
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
