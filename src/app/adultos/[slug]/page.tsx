"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import AgeGate from "@/components/adultos/AgeGate";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface AdultImageData {
  id: string;
  url: string;
  order: number;
  isPresentation: boolean;
  isBlurred: boolean;
}

interface AdultListingDetail {
  id: string;
  code: string;
  alias: string;
  slug: string;
  title: string;
  description: string;
  serviceType: string;
  location: string;
  region: string | null;
  isFeatured: boolean;
  whatsapp: string | null;
  hasBlurredImages: boolean;
  viewCount: number;
  createdAt: string;
  images: AdultImageData[];
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

export default function AdultDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [listing, setListing] = useState<AdultListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [revealCode, setRevealCode] = useState("");
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealError, setRevealError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/adultos/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setListing(data);
          const presIdx = data.images.findIndex((img: AdultImageData) => img.isPresentation);
          if (presIdx >= 0) setSelectedImage(presIdx);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleReveal() {
    if (!revealCode.trim()) return;
    setRevealLoading(true);
    setRevealError("");

    try {
      const res = await fetch("/api/adultos/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: revealCode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.listingId === listing?.id) {
        setRevealed(true);
        setRevealCode("");
      } else if (res.ok && data.listingId !== listing?.id) {
        setRevealError("Este código es de otro anuncio");
      } else {
        setRevealError(data.error || "Código inválido");
      }
    } catch {
      setRevealError("Error de conexión");
    } finally {
      setRevealLoading(false);
    }
  }

  function isImageBlurred(img: AdultImageData) {
    return img.isBlurred && !revealed;
  }

  return (
    <AgeGate>
      <div className="min-h-screen bg-surface">
        {loading ? (
          <div className="flex justify-center py-32">
            <span className="material-symbols-outlined text-4xl text-rose-400 animate-spin">
              progress_activity
            </span>
          </div>
        ) : !listing ? (
          <div className="text-center py-32">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
              error
            </span>
            <h2 className="text-xl font-bold text-on-surface">Anuncio no encontrado</h2>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-rose-900 to-pink-900 px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-7xl mx-auto">
                <Breadcrumbs
                  variant="light"
                  items={[
                    { label: "Inicio", href: "/" },
                    { label: "Adultos", href: "/adultos" },
                    { label: listing.alias },
                  ]}
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Main image */}
                  <div
                    className="relative aspect-square sm:aspect-[4/5] max-h-[70vh] rounded-2xl overflow-hidden bg-surface-low mx-auto select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <Image
                      src={listing.images[selectedImage]?.url || ""}
                      alt={listing.alias}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover pointer-events-none"
                      draggable={false}
                    />
                    {/* Blur overlay */}
                    {isImageBlurred(listing.images[selectedImage]) && (
                      <div
                        className="absolute inset-0 z-10"
                        style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
                      />
                    )}
                    {/* Anti-download overlay */}
                    <div className="absolute inset-0 z-20" />
                  </div>

                  {/* Reveal code input — single code for all images */}
                  {listing.hasBlurredImages && !revealed && (
                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200/30">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-rose-600">lock</span>
                        <h3 className="font-bold text-on-surface text-sm">Revelar imágenes</h3>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-3">
                        Ingresa el código que te proporcionó el anunciante para ver todas las imágenes sin difuminar.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={revealCode}
                          onChange={(e) => setRevealCode(e.target.value.toUpperCase())}
                          placeholder="CÓDIGO"
                          maxLength={8}
                          className="flex-1 bg-white text-center text-sm font-mono tracking-widest px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                          onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                        />
                        <button
                          onClick={handleReveal}
                          disabled={revealLoading || !revealCode.trim()}
                          className="px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-40"
                        >
                          {revealLoading ? "..." : "Revelar"}
                        </button>
                      </div>
                      {revealError && (
                        <p className="text-red-500 text-xs mt-2">{revealError}</p>
                      )}
                    </div>
                  )}

                  {revealed && (
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <span className="text-sm font-bold text-emerald-800">Imágenes reveladas</span>
                    </div>
                  )}

                  {/* Thumbnails */}
                  {listing.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {listing.images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImage(idx)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all select-none ${
                            idx === selectedImage
                              ? "border-rose-500 shadow-md"
                              : `border-transparent ${isImageBlurred(img) ? "opacity-80" : "opacity-60 hover:opacity-100"}`
                          }`}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover pointer-events-none"
                            draggable={false}
                          />
                          {isImageBlurred(img) && (
                            <div
                              className="absolute inset-0"
                              style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/15">
                    <h2 className="font-bold text-on-surface mb-3">Descripción</h2>
                    <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Info card */}
                  <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/15">
                    {listing.isFeatured && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
                        Destacado
                      </span>
                    )}

                    <h1 className="text-xl font-black text-on-surface mb-1">{listing.title}</h1>
                    <p className="text-rose-600 font-bold text-sm mb-4">{listing.alias}</p>

                    <div className="space-y-3 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">category</span>
                        <span>{listing.serviceType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                        <span>{listing.viewCount} visitas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span>{timeAgo(listing.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp contact button */}
                  {listing.whatsapp && (
                    <a
                      href={`https://wa.me/${listing.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, vi tu anuncio "${listing.title}" (código: ${listing.code}) en Tu Cuevita. Me gustaría solicitar el código de revelación de imágenes.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
                      Contactar por WhatsApp
                    </a>
                  )}

                  {/* How it works */}
                  <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-rose-600">info</span>
                      <h3 className="font-bold text-on-surface text-sm">Cómo funciona</h3>
                    </div>
                    <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-sm text-rose-500 mt-0.5 shrink-0">chat</span>
                        Contacta al anunciante por WhatsApp para solicitar el código de revelación.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-sm text-rose-500 mt-0.5 shrink-0">lock_open</span>
                        Con un solo código se revelan todas las fotos difuminadas.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-sm text-rose-500 mt-0.5 shrink-0">timer</span>
                        Cada código dura 1 hora y funciona una sola vez.
                      </li>
                    </ul>
                  </div>

                  {/* Safety tips */}
                  <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-200/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-amber-600">warning</span>
                      <h3 className="font-bold text-on-surface text-sm">Seguridad</h3>
                    </div>
                    <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-sm text-amber-500 mt-0.5 shrink-0">check_circle</span>
                        Nunca compartas datos bancarios ni contraseñas.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-sm text-amber-500 mt-0.5 shrink-0">check_circle</span>
                        Si algo parece sospechoso, no continúes la conversación.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AgeGate>
  );
}
