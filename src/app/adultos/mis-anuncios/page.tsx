"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AgeGate from "@/components/adultos/AgeGate";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface AdultImageOwner {
  id: string;
  url: string;
  order: number;
  isPresentation: boolean;
  isBlurred: boolean;
}

interface Promotion {
  id: string;
  type: string;
  isActive: boolean;
  endDate: string;
}

interface MyAdultListing {
  id: string;
  code: string;
  alias: string;
  slug: string;
  title: string;
  serviceType: string;
  location: string;
  status: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  revealCode: string | null;
  codeExpiresAt: string | null;
  promotion: Promotion | null;
  images: AdultImageOwner[];
}

export default function MisAnunciosAdultosPage() {
  const [listings, setListings] = useState<MyAdultListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCodes, setExpandedCodes] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [copiedCode, setCopiedCode] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const FEATURED_PLANS = [
    { days: 7, label: "7 días", price: "$500 CUP" },
    { days: 15, label: "15 días", price: "$900 CUP" },
    { days: 30, label: "30 días", price: "$1500 CUP" },
  ];

  function buildWhatsAppUrl(listing: MyAdultListing) {
    const plan = FEATURED_PLANS[selectedPlan];
    const text = `Hola, quiero destacar mi anuncio en la sección adultos de La Cuevita.\n\nCódigo: ${listing.code}\nAnuncio: ${listing.title}\nPlan: ${plan.label} (${plan.price})`;
    const phone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "";
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }

  useEffect(() => {
    fetch("/api/adultos/mis-anuncios")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setListings(data.listings || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  }

  async function handleDelete(listingId: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.")) return;
    setDeleting(listingId);
    try {
      const res = await fetch("/api/adultos/mis-anuncios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  }

  return (
    <AgeGate>
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
            <Breadcrumbs
              variant="light"
              items={[
                { label: "Inicio", href: "/" },
                { label: "Adultos", href: "/adultos" },
                { label: "Mis Anuncios" },
              ]}
            />
            <div className="flex items-center justify-between mt-3">
              <h1 className="text-2xl font-black text-white">Mis Servicios</h1>
              <Link
                href="/adultos/publicar"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Nuevo
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-rose-400 animate-spin">progress_activity</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">person</span>
              <h3 className="text-lg font-bold text-on-surface mb-2">No tienes servicios publicados</h3>
              <Link
                href="/adultos/publicar"
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-full font-bold text-sm mt-4"
              >
                Publicar servicio
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/15">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-low shrink-0 relative">
                      {listing.images[0]?.url ? (
                        <Image src={listing.images[0].url} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant/20">person</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          {listing.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          listing.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface">{listing.title}</h3>
                      <p className="text-xs text-rose-600 font-semibold">{listing.alias}</p>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                        <span>{listing.viewCount} visitas</span>
                        <span>{listing.serviceType}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link
                        href={`/adultos/${listing.slug}`}
                        className="px-3 py-2 rounded-lg bg-surface-low text-on-surface-variant text-xs font-semibold hover:bg-surface-container transition-colors text-center"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => setExpandedCodes(expandedCodes === listing.id ? null : listing.id)}
                        className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
                      >
                        {expandedCodes === listing.id ? "Ocultar" : "Códigos"}
                      </button>
                      {!listing.isFeatured && (
                        <button
                          onClick={() => { setPromoting(promoting === listing.id ? null : listing.id); setSelectedPlan(0); }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            promoting === listing.id
                              ? "bg-amber-500 text-white"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          Destacar
                        </button>
                      )}
                      {listing.isFeatured && (
                        <span className="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold text-center flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>star</span>
                          Destacado
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deleting === listing.id}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                      >
                        {deleting === listing.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </div>

                  {/* Promote panel */}
                  {promoting === listing.id && !listing.isFeatured && (
                    <div className="mt-4 pt-4 border-t border-amber-200/30">
                      <p className="text-[10px] sm:text-xs text-amber-900/80 leading-relaxed mb-3">
                        Selecciona un plan y solicita por WhatsApp:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {FEATURED_PLANS.map((plan, i) => (
                          <button
                            key={plan.days}
                            type="button"
                            onClick={() => setSelectedPlan(i)}
                            className={`text-center rounded-lg py-2.5 px-1 transition-all border-2 ${
                              selectedPlan === i
                                ? "border-amber-500 bg-amber-100 shadow-sm"
                                : "border-transparent bg-amber-50 hover:bg-amber-100/70"
                            }`}
                          >
                            <p className="text-[10px] sm:text-xs font-bold text-amber-800">{plan.label}</p>
                            <p className="text-sm sm:text-base font-extrabold text-amber-950">{plan.price}</p>
                          </button>
                        ))}
                      </div>
                      <a
                        href={buildWhatsAppUrl(listing)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#20BD5A] active:scale-95 transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Solicitar por WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Reveal code panel */}
                  {expandedCodes === listing.id && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/15">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
                        Código de revelación
                      </h4>
                      <p className="text-[10px] text-on-surface-variant mb-3">
                        Comparte este código con interesados vía WhatsApp. Un solo código revela todas las imágenes difuminadas. Se regenera automáticamente después de cada uso.
                      </p>

                      {listing.revealCode ? (
                        <div className="bg-rose-50 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-lg font-mono font-black text-rose-700 tracking-[0.3em]">
                              {listing.revealCode}
                            </span>
                            <button
                              onClick={() => copyCode(listing.revealCode!)}
                              className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {copiedCode === listing.revealCode ? "check" : "content_copy"}
                              </span>
                              {copiedCode === listing.revealCode ? "Copiado" : "Copiar"}
                            </button>
                          </div>
                          {listing.codeExpiresAt && (
                            <span className={`text-[10px] block mt-2 ${
                              new Date(listing.codeExpiresAt) < new Date() ? "text-red-500 font-bold" : "text-on-surface-variant"
                            }`}>
                              {new Date(listing.codeExpiresAt) < new Date()
                                ? "Expirado — se renueva al ser utilizado"
                                : `Expira: ${new Date(listing.codeExpiresAt).toLocaleString("es-CU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                              }
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-on-surface-variant italic">
                          Este anuncio no tiene imágenes difuminadas.
                        </p>
                      )}

                      {/* Image thumbnails preview */}
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        {listing.images.map((img, idx) => (
                          <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-low">
                            <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                            {img.isBlurred && (
                              <div
                                className="absolute inset-0"
                                style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
                              />
                            )}
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold text-white bg-black/50 px-1 rounded">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AgeGate>
  );
}
