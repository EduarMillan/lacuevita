"use client";

import { useState, useEffect, useCallback } from "react";
import { regions, type Region } from "@/lib/regions";

interface Offer {
  id: string;
  code: string;
  slug: string;
  title: string;
  businessName: string;
  description: string;
  address: string;
  region: string;
  comuna: string;
  phone: string;
  whatsapp: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  viewCount: number;
  expiresAt: string;
  createdAt: string;
  user: { name: string; avatarUrl: string | null };
  promotions: { endDate: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

import { usePricingPlans } from "@/hooks/usePricingPlans";

interface SlotInfo {
  total: number;
  used: number;
  available: number;
  nextSlotDate: string | null;
}

export default function OffersDirectory() {
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [publishedOffer, setPublishedOffer] = useState<{ code: string; region: string; title: string } | null>(null);
  const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const { plans: featuredPlans } = usePricingPlans("OFFER_FEATURED");

  const selectedRegion: Region | undefined = regions.find(
    (r) => r.id === regionId,
  );

  const fetchOffers = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (regionId) params.set("region", regionId);
      if (comunaId) params.set("comuna", comunaId);
      params.set("page", String(page));
      params.set("limit", "18");

      try {
        const res = await fetch(`/api/ofertas?${params}`);
        const data = await res.json();
        setOffers(data.offers);
        setPagination(data.pagination);
      } catch {
        console.error("Error fetching offers");
      } finally {
        setLoading(false);
      }
    },
    [search, regionId, comunaId],
  );

  useEffect(() => {
    const timeout = setTimeout(() => fetchOffers(), 300);
    return () => clearTimeout(timeout);
  }, [fetchOffers]);

  function handleRegionChange(value: string) {
    setRegionId(value);
    setComunaId("");
  }

  function buildWhatsAppUrl(code: string, title: string, planIndex: number) {
    const plan = featuredPlans[planIndex];
    const phone = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "";
    const planLabel = plan ? `${plan.label} (${plan.price})` : "Sin plan seleccionado";
    const message = encodeURIComponent(
      `Hola! Quiero destacar mi oferta:\n\n` +
      `Codigo: ${code}\n` +
      `Titulo: ${title}\n` +
      `Plan: ${planLabel}\n\n` +
      `Quedo atento, gracias!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  return (
    <>
      {/* Search & Filters */}
      <section className="bg-surface-low py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-lowest rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex gap-2 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar ofertas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/60 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => fetchOffers()}
                className="inline-flex items-center gap-1.5 bg-tertiary text-on-tertiary px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl font-semibold text-sm hover:bg-tertiary/90 active:scale-95 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Provincia
                </label>
                <select
                  value={regionId}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas las regiones</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.romanNumeral} - {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Municipio
                </label>
                <select
                  value={comunaId}
                  onChange={(e) => setComunaId(e.target.value)}
                  disabled={!regionId}
                  className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Todas las comunas</option>
                  {selectedRegion?.comunas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success banner after publishing */}
      {publishedOffer && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6 relative">
            <button
              onClick={() => { setPublishedOffer(null); setSlotInfo(null); }}
              className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="material-symbols-outlined text-2xl sm:text-4xl text-amber-500 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <div className="space-y-2 min-w-0 pr-6">
                <h3 className="text-base sm:text-xl font-extrabold text-amber-900 tracking-tight">
                  ¡Oferta publicada con éxito!
                </h3>
                <p className="text-xs sm:text-sm text-amber-800/80 leading-relaxed">
                  Tu código de identificación es{" "}
                  <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded font-mono">
                    <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>tag</span>
                    {publishedOffer.code}
                  </span>
                  . Tu oferta ya está visible. Si quieres que aparezca primero, puedes <strong>destacarla</strong>.
                </p>

                {/* Slot info */}
                {slotInfo ? (
                  slotInfo.available > 0 ? (
                    <div className="flex items-start gap-2 sm:gap-3 bg-amber-100/80 text-amber-900 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 mt-2">
                      <span className="material-symbols-outlined text-base sm:text-lg text-amber-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <div>
                        <p className="text-[11px] sm:text-sm font-bold">
                          ¡Hay {slotInfo.available} {slotInfo.available === 1 ? "cupo disponible" : "cupos disponibles"} para destacar en tu región!
                        </p>
                        <p className="text-[10px] sm:text-xs text-amber-800/80 mt-1">
                          Selecciona un plan y solicita por WhatsApp.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 sm:gap-3 bg-orange-100/80 text-orange-900 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 mt-2">
                      <span className="material-symbols-outlined text-base sm:text-lg text-orange-500 shrink-0 mt-0.5">hourglass_top</span>
                      <div>
                        <p className="text-[11px] sm:text-sm font-bold">
                          Cupos llenos en tu región ({slotInfo.total}/{slotInfo.total}).
                        </p>
                        {slotInfo.nextSlotDate && (
                          <p className="text-[10px] sm:text-xs text-orange-800/80 mt-1">
                            Próximo cupo: <strong>{new Date(slotInfo.nextSlotDate).toLocaleDateString("es-CU", { day: "numeric", month: "long" })}</strong>.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                ) : null}

                {/* Plan picker + WhatsApp */}
                <div className="space-y-2.5 sm:space-y-3 mt-2 sm:mt-3">
                  <div className={`grid gap-1.5 sm:gap-2 ${featuredPlans.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                    {featuredPlans.map((plan, i) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(i)}
                        className={`text-center rounded-lg py-1.5 sm:py-2 px-1 transition-all border-2 ${
                          selectedPlan === i
                            ? "border-amber-500 bg-amber-100 shadow-sm"
                            : "border-transparent bg-amber-50 hover:bg-amber-100/70"
                        }`}
                      >
                        <p className="text-[9px] sm:text-xs font-bold text-amber-800">{plan.label}</p>
                        <p className="text-[11px] sm:text-sm font-extrabold text-amber-950">{plan.price}</p>
                      </button>
                    ))}
                    {featuredPlans.length === 0 && (
                      <p className="col-span-3 text-xs text-amber-900/70 italic py-2 text-center">
                        Sin planes disponibles
                      </p>
                    )}
                  </div>
                  <a
                    href={buildWhatsAppUrl(publishedOffer.code, publishedOffer.title, selectedPlan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#25D366] text-white py-2 sm:py-2.5 rounded-lg font-bold text-[11px] sm:text-sm hover:bg-[#20BD5A] active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Solicitar Destacado por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Ofertas Disponibles
            </h2>
            {pagination && (
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                {pagination.total}{" "}
                {pagination.total === 1
                  ? "encontrada"
                  : "encontradas"}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">
              campaign
            </span>
            <span className="hidden sm:inline">Publicar Oferta</span>
            <span className="sm:hidden">Publicar</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-lowest rounded-2xl overflow-hidden animate-pulse shadow-sm"
              >
                <div className="h-3 bg-tertiary-container/30 w-full" />
                <div className="p-6">
                  <div className="h-5 bg-surface-container rounded-lg w-3/4 mb-3" />
                  <div className="h-4 bg-surface-container rounded-lg w-1/2 mb-4" />
                  <div className="h-3 bg-surface-container rounded-lg w-full mb-2" />
                  <div className="h-3 bg-surface-container rounded-lg w-4/5 mb-5" />
                  <div className="h-3 bg-surface-container rounded-lg w-2/3 mb-2" />
                  <div className="h-3 bg-surface-container rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : offers.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {offers.map((offer, i) => (
                <OfferCard key={offer.id} offer={offer} index={i} now={Date.now()} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <PaginationBar
                current={pagination.page}
                total={pagination.totalPages}
                totalItems={pagination.total}
                onPageChange={fetchOffers}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-surface-lowest rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">
              storefront
            </span>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              No hay ofertas disponibles
            </h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
              {search || regionId
                ? "Intenta con otros términos de búsqueda o filtros."
                : "Sé el primero en publicar una oferta para tu comercio."}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary px-8 py-3 rounded-full font-semibold shadow-lg"
            >
              <span className="material-symbols-outlined">campaign</span>
              Publicar Oferta
            </button>
          </div>
        )}
      </section>

      {/* Registration Form */}
      {showForm && (
        <OfferForm
          onClose={() => setShowForm(false)}
          onSuccess={(offer) => {
            setShowForm(false);
            setPublishedOffer({ code: offer.code, region: offer.region, title: offer.title });
            // Fetch slot info for the region
            fetch(`/api/promotions/offer-slots?region=${offer.region}`)
              .then((res) => res.ok ? res.json() : null)
              .then((data) => { if (data) setSlotInfo(data); })
              .catch(() => {});
            fetchOffers();
          }}
        />
      )}
    </>
  );
}

/* ─── Offer Card ─────────────────────────────────────────── */

function OfferCard({ offer, index, now }: { offer: Offer; index: number; now: number }) {
  const [expanded, setExpanded] = useState(false);
  const regionData = regions.find((r) => r.id === offer.region);
  const comunaData = regionData?.comunas.find((c) => c.id === offer.comuna);

  const expiresAt = new Date(offer.expiresAt);
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - now) / (1000 * 60 * 60 * 24),
  );

  const urgencyClass =
    daysLeft <= 2
      ? "from-error to-error/80 text-on-error"
      : daysLeft <= 5
        ? "from-tertiary to-tertiary/80 text-on-tertiary"
        : "from-primary to-primary-container text-on-primary";

  // Featured promotion days remaining
  const activePromotion = offer.promotions?.[0];
  const featuredDaysLeft = activePromotion
    ? Math.max(0, Math.ceil((new Date(activePromotion.endDate).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div
      className={`group relative bg-surface-lowest rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(135,82,0,0.15)] border ${
        offer.isFeatured
          ? "border-amber-300/60 ring-2 ring-amber-300/40"
          : "border-transparent hover:border-tertiary/20"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Glow */}
      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${
        offer.isFeatured
          ? "from-amber-400/15 via-transparent to-amber-300/15 opacity-100"
          : "from-tertiary/10 via-transparent to-orange-400/10 opacity-0 group-hover:opacity-100"
      } transition-opacity duration-500 -z-10 blur-sm`} />

      {/* Featured badge */}
      {offer.isFeatured && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold flex items-center justify-between text-amber-950">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs sm:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Destacado
          </span>
          {featuredDaysLeft > 0 && (
            <span>{featuredDaysLeft}d restantes</span>
          )}
        </div>
      )}

      {/* Expiry ribbon */}
      <div
        className={`bg-gradient-to-r ${urgencyClass} px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold flex items-center justify-between`}
      >
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs sm:text-sm">schedule</span>
          {daysLeft <= 0
            ? "Hoy"
            : daysLeft === 1
              ? "1 día"
              : `${daysLeft} días`}
        </span>
        <span>
          {expiresAt.toLocaleDateString("es-CU", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <div className="p-3 sm:p-6 flex-1 flex flex-col">
        {/* Code badge */}
        <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded mb-1.5 w-fit">
          <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>tag</span>
          <span className="font-mono tracking-wide">{offer.code}</span>
        </span>

        {/* Title & Business */}
        <h3 className="text-sm sm:text-lg font-bold text-on-surface leading-tight mb-1 group-hover:text-tertiary transition-colors duration-300 line-clamp-2">
          {offer.title}
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-tertiary mb-2 sm:mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm shrink-0">
            storefront
          </span>
          <span className="truncate">{offer.businessName}</span>
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
          {offer.description}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-5">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-xs sm:text-sm text-secondary shrink-0">
              location_on
            </span>
            <span className="truncate">
              {comunaData?.name || offer.comuna}
              {regionData ? `, ${regionData.shortName}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-xs sm:text-sm text-secondary shrink-0">
              call
            </span>
            <span className="truncate">{offer.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-xs sm:text-sm text-secondary shrink-0">
              visibility
            </span>
            <span>{offer.viewCount} visitas</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-1.5 sm:space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-2 sm:py-2.5 rounded-xl bg-surface-low text-on-surface-variant font-semibold text-xs sm:text-sm hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-base">{expanded ? "expand_less" : "expand_more"}</span>
            {expanded ? "Ver menos" : "Ver más"}
          </button>
          <div className="flex gap-1.5 sm:gap-2">
            <a
              href={`tel:${offer.phone}`}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl bg-tertiary/5 text-tertiary font-semibold text-xs sm:text-sm hover:bg-tertiary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">call</span>
              <span className="hidden sm:inline">Llamar</span>
            </a>
            {offer.whatsapp && (
              <a
                href={`https://wa.me/${offer.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs sm:text-sm hover:bg-emerald-100 transition-colors"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">chat</span>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-outline-variant/15 space-y-2">
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
              {offer.description}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-xs sm:text-sm text-secondary shrink-0">location_on</span>
              <span>{offer.address}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────── */

function PaginationBar({
  current,
  total,
  totalItems,
  onPageChange,
}: {
  current: number;
  total: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  function getPageNumbers(): (number | "dots")[] {
    const pages: (number | "dots")[] = [];
    const delta = 2;
    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    pages.push(1);
    if (rangeStart > 2) pages.push("dots");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < total - 1) pages.push("dots");
    if (total > 1) pages.push(total);

    return pages;
  }

  const pages = getPageNumbers();
  const from = (current - 1) * 18 + 1;
  const to = Math.min(current * 18, totalItems);

  return (
    <div className="mt-14 flex flex-col items-center gap-5">
      <p className="text-sm text-on-surface-variant">
        Mostrando{" "}
        <span className="font-bold text-on-surface">
          {from}-{to}
        </span>{" "}
        de <span className="font-bold text-on-surface">{totalItems}</span>{" "}
        ofertas — Página{" "}
        <span className="font-bold text-on-surface">{current}</span> de{" "}
        <span className="font-bold text-on-surface">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-xl">
            chevron_left
          </span>
        </button>
        {pages.map((p, i) =>
          p === "dots" ? (
            <span
              key={`dots-${i}`}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${
                current === p
                  ? "bg-tertiary text-on-tertiary shadow-md shadow-tertiary/25 scale-110"
                  : "text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(current + 1)}
          disabled={current === total}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-xl">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─── Offer Form ─────────────────────────────────────────── */

function OfferForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (offer: { code: string; region: string; title: string }) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    businessName: "",
    description: "",
    address: "",
    region: "",
    comuna: "",
    phone: "",
    whatsapp: "",
    expiresAt: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedRegion = regions.find((r) => r.id === formData.region);

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  function updateField(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "region" ? { comuna: "" } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/ofertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          businessName: formData.businessName,
          description: formData.description,
          address: formData.address,
          region: formData.region,
          comuna: formData.comuna,
          phone: formData.phone,
          whatsapp: formData.whatsapp || null,
          expiresAt: formData.expiresAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al publicar");
        return;
      }

      onSuccess({
        code: data.offer.code,
        region: formData.region,
        title: formData.title,
      });
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-lowest rounded-t-3xl px-5 sm:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-on-surface">
              Publicar Oferta
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant hover:bg-surface-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Publica la oferta de tu comercio para que la comunidad la vea
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Título de la oferta */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Título de la oferta *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: 2x1 en pizzas familiares, 30% en cortes de pelo..."
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30"
            />
          </div>

          {/* Nombre del comercio */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Nombre del comercio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pizzería Don Mario, Peluquería Estilo..."
              value={formData.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Descripción de la oferta *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detalla tu oferta: qué incluye, condiciones, horarios..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30 resize-none"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Dirección del comercio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Av. Libertador 1234, Local 5"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30"
            />
          </div>

          {/* Region / Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Provincia *
              </label>
              <select
                required
                value={formData.region}
                onChange={(e) => updateField("region", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30 appearance-none cursor-pointer"
              >
                <option value="">Seleccionar</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.romanNumeral} - {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Municipio *
              </label>
              <select
                required
                value={formData.comuna}
                onChange={(e) => updateField("comuna", e.target.value)}
                disabled={!formData.region}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30 appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Seleccionar</option>
                {selectedRegion?.comunas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha de expiración */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Válida hasta *
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={formData.expiresAt}
              onChange={(e) => updateField("expiresAt", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30"
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                placeholder="+53 5 123 4567"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+53 5 123 4567"
                value={formData.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-tertiary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitting ? "Publicando..." : "Publicar Oferta"}
          </button>
        </form>
      </div>
    </div>
  );
}
