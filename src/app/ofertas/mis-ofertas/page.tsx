"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { regions } from "@/lib/regions";

interface Promotion {
  id: string;
  endDate: string;
  isActive: boolean;
}

interface MyOffer {
  id: string;
  code: string;
  title: string;
  businessName: string;
  address: string;
  region: string;
  comuna: string;
  phone: string;
  whatsapp: string | null;
  isFeatured: boolean;
  viewCount: number;
  expiresAt: string;
  createdAt: string;
  promotions: Promotion[];
}

const FEATURED_PLANS = [
  { days: 7, label: "7 días", price: "$500 CUP" },
  { days: 15, label: "15 días", price: "$900 CUP" },
  { days: 30, label: "30 días", price: "$1500 CUP" },
];

export default function MisOfertasPage() {
  const [offers, setOffers] = useState<MyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ofertas/mis-ofertas")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setOffers(data.offers || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function buildWhatsAppUrl(offer: MyOffer) {
    const plan = FEATURED_PLANS[selectedPlan];
    const text = `Hola, quiero destacar mi oferta en La Cuevita.\n\nCódigo: ${offer.code}\nOferta: ${offer.title}\nNegocio: ${offer.businessName}\nPlan: ${plan.label} (${plan.price})`;
    const phone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "";
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }

  async function handleDelete(offerId: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta oferta? Esta acción no se puede deshacer.")) return;
    setDeleting(offerId);
    try {
      const res = await fetch("/api/ofertas/mis-ofertas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
          <Breadcrumbs
            variant="light"
            items={[
              { label: "Inicio", href: "/" },
              { label: "Ofertas", href: "/ofertas" },
              { label: "Mis Ofertas" },
            ]}
          />
          <div className="flex items-center justify-between mt-3">
            <h1 className="text-2xl font-black text-white">Mis Ofertas</h1>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Nueva
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-amber-400 animate-spin">progress_activity</span>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">local_offer</span>
            <h3 className="text-lg font-bold text-on-surface mb-2">No tienes ofertas publicadas</h3>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm mt-4"
            >
              Publicar oferta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const regionData = regions.find((r) => r.id === offer.region);
              const comunaData = regionData?.comunas.find((c) => c.id === offer.comuna);
              const expired = new Date(offer.expiresAt) <= new Date();
              const daysLeft = Math.max(0, Math.ceil((new Date(offer.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              const activePromo = offer.promotions?.[0];
              const featuredDaysLeft = activePromo
                ? Math.max(0, Math.ceil((new Date(activePromo.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : 0;

              return (
                <div key={offer.id} className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/15">
                  {/* Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {offer.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        expired ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {expired ? "Expirada" : `${daysLeft}d restantes`}
                      </span>
                      {offer.isFeatured && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>star</span>
                          Destacado {featuredDaysLeft > 0 ? `(${featuredDaysLeft}d)` : ""}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-on-surface">{offer.title}</h3>
                    <p className="text-xs text-amber-700 font-semibold">{offer.businessName}</p>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                      <span>{offer.viewCount} visitas</span>
                      <span>{comunaData?.name || offer.comuna}{regionData ? `, ${regionData.shortName}` : ""}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!offer.isFeatured && !expired && (
                      <button
                        onClick={() => { setPromoting(promoting === offer.id ? null : offer.id); setSelectedPlan(0); }}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                          promoting === offer.id
                            ? "bg-amber-500 text-white"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        Destacar
                      </button>
                    )}
                    {offer.isFeatured && (
                      <span className="flex-1 px-3 py-2.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold text-center flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>star</span>
                        Destacado
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(offer.id)}
                      disabled={deleting === offer.id}
                      className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                    >
                      {deleting === offer.id ? "..." : "Eliminar"}
                    </button>
                  </div>

                  {/* Promote panel */}
                  {promoting === offer.id && !offer.isFeatured && !expired && (
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
                        href={buildWhatsAppUrl(offer)}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
