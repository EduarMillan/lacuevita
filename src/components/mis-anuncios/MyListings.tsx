"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Listing {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  currency?: string;
  condition: string;
  status: string;
  isFeatured: boolean;
  location: string;
  createdAt: string;
  images: { url: string }[];
  category: { name: string; slug: string } | null;
  promotions: { endDate: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  ACTIVE: { label: "Activo", color: "bg-emerald-100 text-emerald-800", icon: "check_circle" },
  PAUSED: { label: "Pausado", color: "bg-amber-100 text-amber-800", icon: "pause_circle" },
  DRAFT: { label: "Borrador", color: "bg-slate-100 text-slate-600", icon: "edit_note" },
  EXPIRED: { label: "Expirado", color: "bg-red-100 text-red-700", icon: "schedule" },
  REMOVED: { label: "Eliminado", color: "bg-red-100 text-red-700", icon: "delete" },
};

const conditionLabels: Record<string, string> = {
  NEW: "Nuevo",
  LIKE_NEW: "Como nuevo",
  USED: "Usado",
  FOR_PARTS: "Para repuestos",
};

import { formatPrice } from "@/lib/format";

function timeAgo(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000,
  );
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

const FEATURED_PLANS = [
  { days: 7, price: "$500 CUP", label: "7 días" },
  { days: 15, price: "$900 CUP", label: "15 días" },
  { days: 30, price: "$1500 CUP", label: "30 días" },
];

interface SlotInfo {
  total: number;
  used: number;
  available: number;
  nextSlotDate: string | null;
}

export default function MyListings({ newListingCode, categorySlug }: { newListingCode?: string; categorySlug?: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [showSuccessBanner, setShowSuccessBanner] = useState(!!newListingCode);
  const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null);

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/mis-anuncios?page=${page}&limit=12`);
      if (res.status === 401) {
        setError("Debes iniciar sesión para ver tus anuncios.");
        setListings([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al cargar los anuncios.");
        setListings([]);
        return;
      }
      setListings(data.listings || []);
      setPagination(data.pagination);
    } catch {
      setError("Error al cargar los anuncios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (categorySlug && newListingCode) {
      fetch(`/api/promotions/slots?category=${categorySlug}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setSlotInfo(data); })
        .catch(() => {});
    }
  }, [categorySlug, newListingCode]);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este anuncio? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total - 1 });
        }
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)),
        );
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar");
      }
    } catch {
      alert("Error de conexión");
    }
  }

  if (error) {
    return (
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center py-12 sm:py-16 bg-surface-lowest rounded-2xl px-4">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-on-surface-variant/30 mb-4 block">
            lock
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">{error}</h3>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg mt-4"
          >
            Iniciar Sesión
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Success banner after publishing */}
      {showSuccessBanner && newListingCode && (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6 relative">
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-emerald-500 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <div className="space-y-2 min-w-0">
              <h3 className="text-lg sm:text-xl font-extrabold text-emerald-900 tracking-tight">
                ¡Anuncio publicado con éxito!
              </h3>
              <p className="text-sm text-emerald-800/80 leading-relaxed">
                Tu código de identificación es{" "}
                <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded font-mono">
                  <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>tag</span>
                  {newListingCode}
                </span>
                . Desde aquí puedes gestionar todos tus anuncios: editar, pausar, eliminar o <strong>destacarlos</strong> para que aparezcan primero.
              </p>
              {/* Slot availability + CTA */}
              {slotInfo ? (
                slotInfo.available > 0 ? (
                  <div className="flex items-start gap-3 bg-amber-100/80 text-amber-900 rounded-xl px-4 py-3 mt-2">
                    <span className="material-symbols-outlined text-lg text-amber-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">
                        ¡Hay {slotInfo.available} {slotInfo.available === 1 ? "cupo disponible" : "cupos disponibles"} para destacar en esta categoría!
                      </p>
                      <p className="text-xs text-amber-800/80 mt-1">
                        Presiona <strong>&quot;Destacar anuncio&quot;</strong> en tu publicación para aparecer primero.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-orange-100/80 text-orange-900 rounded-xl px-4 py-3 mt-2">
                    <span className="material-symbols-outlined text-lg text-orange-500 shrink-0 mt-0.5">hourglass_top</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">
                        Los cupos de destacados están llenos en esta categoría ({slotInfo.total}/{slotInfo.total}).
                      </p>
                      {slotInfo.nextSlotDate && (
                        <p className="text-xs text-orange-800/80 mt-1">
                          El próximo cupo se libera el{" "}
                          <strong>
                            {new Date(slotInfo.nextSlotDate).toLocaleDateString("es-CU", {
                              day: "numeric",
                              month: "long",
                            })}
                          </strong>
                          . Puedes solicitar tu destacado ahora y lo activaremos apenas haya disponibilidad.
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 bg-amber-100/80 text-amber-900 rounded-xl px-4 py-3 mt-2">
                  <span className="material-symbols-outlined text-lg text-amber-600 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <p className="text-xs sm:text-sm font-medium">
                    ¿Quieres más visibilidad? Presiona <strong>&quot;Destacar anuncio&quot;</strong> en tu publicación para ver los planes disponibles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            Tus Publicaciones
          </h2>
          {pagination && (
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              {pagination.total}{" "}
              {pagination.total === 1 ? "anuncio" : "anuncios"}
            </p>
          )}
        </div>
        <Link
          href="/publicar"
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">add_circle</span>
          <span className="hidden sm:inline">Nuevo Anuncio</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface-lowest rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-surface-container" />
              <div className="p-4">
                <div className="h-4 bg-surface-container rounded-lg w-3/4 mb-2" />
                <div className="h-3 bg-surface-container rounded-lg w-1/2 mb-3" />
                <div className="h-8 bg-surface-container rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                now={Date.now()}
                deleting={deletingId === listing.id}
                onDelete={() => handleDelete(listing.id)}
                onStatusChange={(status) =>
                  handleStatusChange(listing.id, status)
                }
                isPromoting={promotingId === listing.id}
                selectedPlan={selectedPlan}
                onTogglePromote={() => {
                  setPromotingId(promotingId === listing.id ? null : listing.id);
                  setSelectedPlan(0);
                }}
                onSelectPlan={setSelectedPlan}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchListings(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    pagination.page === i + 1
                      ? "bg-primary text-on-primary shadow-md"
                      : "text-on-surface-variant hover:bg-primary/10"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-surface-lowest rounded-2xl px-4">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-on-surface-variant/30 mb-4 block">
            inventory_2
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">
            No tienes anuncios publicados
          </h3>
          <p className="text-sm sm:text-base text-on-surface-variant mb-6">
            Publica tu primer anuncio y empieza a vender.
          </p>
          <Link
            href="/publicar"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Publicar Anuncio
          </Link>
        </div>
      )}
    </section>
  );
}

/* ─── Listing Card ───────────────────────────────────────── */

function ListingCard({
  listing,
  now,
  deleting,
  onDelete,
  onStatusChange,
  isPromoting,
  selectedPlan,
  onTogglePromote,
  onSelectPlan,
}: {
  listing: Listing;
  now: number;
  deleting: boolean;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  isPromoting: boolean;
  selectedPlan: number;
  onTogglePromote: () => void;
  onSelectPlan: (index: number) => void;
}) {
  const [cardSlots, setCardSlots] = useState<SlotInfo | null>(null);
  const [slotsFetched, setSlotsFetched] = useState(false);

  const st = statusLabels[listing.status] || statusLabels.ACTIVE;

  // Calculate remaining featured days
  const activePromotion = listing.promotions?.[0];
  const daysRemaining = activePromotion
    ? Math.max(0, Math.ceil((new Date(activePromotion.endDate).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const canPromote = listing.status === "ACTIVE" && !listing.isFeatured;
  const loadingSlots = isPromoting && !!listing.category?.slug && !slotsFetched;

  useEffect(() => {
    if (isPromoting && listing.category?.slug) {
      fetch(`/api/promotions/slots?category=${listing.category.slug}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setCardSlots(data); })
        .catch(() => {})
        .finally(() => setSlotsFetched(true));
    }
  }, [isPromoting, listing.category?.slug]);

  function buildWhatsAppUrl() {
    const plan = FEATURED_PLANS[selectedPlan];
    const phone = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "";
    const message = encodeURIComponent(
      `Hola! Quiero destacar mi anuncio:\n\n` +
      `Codigo: ${listing.code}\n` +
      `Titulo: ${listing.title}\n` +
      `Plan: ${plan.label} (${plan.price})\n\n` +
      `Quedo atento, gracias!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  return (
    <div className={`group bg-surface-lowest rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col ${
      listing.isFeatured ? "ring-2 ring-amber-300/60" : ""
    }`}>
      {/* Image */}
      <Link href={`/anuncio/${listing.slug}`} className="relative block">
        {listing.images[0]?.url ? (
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={listing.images[0].url}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-surface-low flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">
              image
            </span>
          </div>
        )}
        {/* Status badge over image */}
        <span className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 ${st.color}`}>
          <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>{st.icon}</span>
          {st.label}
        </span>
        {/* Featured badge */}
        {listing.isFeatured && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950">
            <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="hidden sm:inline">{daysRemaining}d</span>
          </span>
        )}
        {/* Price over image */}
        <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/70 text-white text-xs sm:text-sm font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg backdrop-blur-sm">
          {formatPrice(listing.price, listing.currency as "CUP" | "USD" | "MLC" | undefined)}
        </span>
      </Link>

      {/* Info */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
        {/* Listing code */}
        <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded mb-1 w-fit">
          <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>tag</span>
          <span className="font-mono tracking-wide">{listing.code}</span>
        </span>
        <Link
          href={`/anuncio/${listing.slug}`}
          className="text-xs sm:text-sm font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 mb-0.5 sm:mb-1"
        >
          {listing.title}
        </Link>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-on-surface-variant mb-0.5 sm:mb-1">
          <span className="material-symbols-outlined shrink-0" style={{ fontSize: "12px" }}>location_on</span>
          <span className="truncate">{listing.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-on-surface-variant mb-2 sm:mb-3">
          <span className="truncate">{conditionLabels[listing.condition] || listing.condition}</span>
          <span>&middot;</span>
          <span className="shrink-0">{timeAgo(listing.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-1.5">
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            <Link
              href={`/mis-anuncios/editar/${listing.id}`}
              className="flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 rounded-lg bg-primary/5 text-primary text-[10px] sm:text-xs font-semibold hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>edit</span>
              <span className="hidden sm:inline">Editar</span>
            </Link>

            {listing.status === "ACTIVE" ? (
              <button
                onClick={() => onStatusChange("PAUSED")}
                className="flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 rounded-lg bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>pause</span>
                <span className="hidden sm:inline">Pausar</span>
              </button>
            ) : listing.status === "PAUSED" ? (
              <button
                onClick={() => onStatusChange("ACTIVE")}
                className="flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>play_arrow</span>
                <span className="hidden sm:inline">Activar</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 rounded-lg bg-red-50 text-red-700 text-[10px] sm:text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
              <span className="hidden sm:inline">{deleting ? "..." : "Eliminar"}</span>
            </button>
          </div>

          {/* Promote button */}
          {canPromote && (
            <button
              onClick={onTogglePromote}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                isPromoting
                  ? "bg-amber-500 text-white"
                  : "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
              Destacar anuncio
            </button>
          )}
        </div>

        {/* Promote panel */}
        {isPromoting && canPromote && (
          <div className="mt-3 pt-3 border-t border-amber-200/50 space-y-3">
            {/* Slot availability */}
            {loadingSlots ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="material-symbols-outlined text-amber-500 text-sm animate-spin">progress_activity</span>
                <span className="text-[10px] text-amber-800">Verificando disponibilidad...</span>
              </div>
            ) : cardSlots ? (
              cardSlots.available > 0 ? (
                <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                  <p className="text-[10px] sm:text-[11px] font-bold text-emerald-800">
                    {cardSlots.available} {cardSlots.available === 1 ? "cupo disponible" : "cupos disponibles"}
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-sm">hourglass_top</span>
                    <p className="text-[10px] sm:text-[11px] font-bold text-orange-800">
                      Sin cupos disponibles ({cardSlots.total}/{cardSlots.total})
                    </p>
                  </div>
                  {cardSlots.nextSlotDate && (
                    <p className="text-[10px] text-orange-700/80 pl-6">
                      Próximo cupo: <strong>{new Date(cardSlots.nextSlotDate).toLocaleDateString("es-CU", { day: "numeric", month: "long" })}</strong>.
                      Solicita ahora y te activamos apenas se libere.
                    </p>
                  )}
                </div>
              )
            ) : null}

            <p className="text-[10px] sm:text-[11px] text-amber-900/80 leading-relaxed">
              Selecciona un plan y solicita por WhatsApp:
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              {FEATURED_PLANS.map((plan, i) => (
                <button
                  key={plan.days}
                  type="button"
                  onClick={() => onSelectPlan(i)}
                  className={`text-center rounded-lg py-2 px-1 transition-all border-2 ${
                    selectedPlan === i
                      ? "border-amber-500 bg-amber-100 shadow-sm"
                      : "border-transparent bg-amber-50 hover:bg-amber-100/70"
                  }`}
                >
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-800">{plan.label}</p>
                  <p className="text-xs sm:text-sm font-extrabold text-amber-950">{plan.price}</p>
                </button>
              ))}
            </div>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#20BD5A] active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Solicitar por WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
