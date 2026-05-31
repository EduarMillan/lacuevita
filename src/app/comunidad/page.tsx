import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProfessionalDirectory from "@/components/comunidad/ProfessionalDirectory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comunidad — Directorio de Profesionales",
  description:
    "Encuentra profesionales de confianza en tu comunidad. Electricistas, plomeros, diseñadores y más. Busca por profesión, provincia y municipio en toda Cuba.",
  alternates: { canonical: "/comunidad" },
};

export default function ComunidadPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-6 lg:px-8 py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Comunidad" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-white/80 text-lg">
                engineering
              </span>
              <span className="text-sm font-semibold text-white/90 tracking-wide">
                Directorio de profesionales
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              Profesionales de{" "}
              <span className="text-cyan-300">confianza</span>
            </h1>
            <p className="text-base text-white/80 max-w-xl leading-relaxed">
              Encuentra profesionales en tu zona o regístrate para ofrecer tus servicios.
            </p>
          </div>
        </div>
      </section>

      <ProfessionalDirectory />

      {/* CTA */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-20">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 p-8 sm:p-12 lg:p-16 rounded-2xl sm:rounded-[3rem] text-white flex flex-col items-center text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <span className="material-symbols-outlined text-4xl sm:text-5xl text-cyan-300 mb-4 sm:mb-5 relative z-10">
            handshake
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 relative z-10">
            Ofrece tus servicios a la comunidad
          </h2>
          <p className="text-sm sm:text-lg text-white/80 max-w-2xl mb-6 sm:mb-8 relative z-10">
            Regístrate gratis y aparece en el directorio.
          </p>
        </div>
      </section>
    </>
  );
}
