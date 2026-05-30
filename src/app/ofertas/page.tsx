import Breadcrumbs from "@/components/ui/Breadcrumbs";
import OffersDirectory from "@/components/ofertas/OffersDirectory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofertas — Comercios Locales",
  description:
    "Descubre las mejores ofertas de comercios cerca de ti. Descuentos, promociones y ofertas especiales de negocios locales en tu comunidad.",
  alternates: { canonical: "/ofertas" },
};

export default function OfertasPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-6 lg:px-8 py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Ofertas" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-white/80 text-lg">
                local_offer
              </span>
              <span className="text-sm font-semibold text-white/90 tracking-wide">
                Ofertas de comercios locales
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              Las mejores{" "}
              <span className="text-yellow-200">ofertas</span> cerca de ti
            </h1>
            <p className="text-base text-white/80 max-w-xl leading-relaxed">
              Promociones y descuentos de los comercios de tu barrio. Apoya el comercio local.
            </p>
          </div>
        </div>
      </section>

      <OffersDirectory />

      {/* CTA */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-20">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-8 sm:p-12 lg:p-16 rounded-2xl sm:rounded-[3rem] text-white flex flex-col items-center text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <span className="material-symbols-outlined text-4xl sm:text-5xl text-yellow-200 mb-4 sm:mb-5 relative z-10">
            store
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 relative z-10">
            ¿Tienes un comercio?
          </h2>
          <p className="text-sm sm:text-lg text-white/80 max-w-2xl mb-6 sm:mb-8 relative z-10">
            Publica tus ofertas gratis y llega a miles de personas en tu comunidad.
          </p>
        </div>
      </section>
    </>
  );
}
