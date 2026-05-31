import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/categories";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Todas las categorías",
  description:
    "Explora todas las categorías de Tu Cuevita: vehículos, vivienda, electrónica, empleos, servicios y mucho más. Compra y vende en Cuba.",
  alternates: { canonical: "/categorias" },
};

const sectionColors: Record<string, { bg: string; icon: string; accent: string }> = {
  "compra-venta": { bg: "bg-teal-50/60", icon: "bg-teal-100 text-teal-700", accent: "hover:bg-teal-50" },
  "vehiculos": { bg: "bg-sky-50/60", icon: "bg-sky-100 text-sky-700", accent: "hover:bg-sky-50" },
  "vivienda": { bg: "bg-violet-50/60", icon: "bg-violet-100 text-violet-700", accent: "hover:bg-violet-50" },
  "empleos": { bg: "bg-indigo-50/60", icon: "bg-indigo-100 text-indigo-700", accent: "hover:bg-indigo-50" },
  "servicios": { bg: "bg-amber-50/60", icon: "bg-amber-100 text-amber-700", accent: "hover:bg-amber-50" },
  "electronica": { bg: "bg-rose-50/60", icon: "bg-rose-100 text-rose-700", accent: "hover:bg-rose-50" },
  "comunidad": { bg: "bg-cyan-50/60", icon: "bg-cyan-100 text-cyan-700", accent: "hover:bg-cyan-50" },
};

const defaultColor = { bg: "bg-surface-low", icon: "bg-primary/10 text-primary", accent: "hover:bg-primary/5" };

export default function CategoriasPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-6 lg:px-8 py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Categorías" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-white/80 text-lg">
                category
              </span>
              <span className="text-sm font-semibold text-white/90 tracking-wide">
                Todas las categorías
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              Explora el{" "}
              <span className="text-emerald-200">pabellón</span> completo
            </h1>
            <p className="text-base text-white/80 max-w-xl leading-relaxed">
              Encuentra lo que buscas. Desde tecnología hasta servicios para el hogar.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-10">
          {categories.map((cat) => {
            const colors = sectionColors[cat.slug] || defaultColor;
            return (
              <section
                key={cat.slug}
                className={`${colors.bg} rounded-2xl p-4 sm:p-8 transition-colors`}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.icon} rounded-full flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                      {cat.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-on-surface">
                      {cat.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      {cat.children?.length || 0} subcategorías
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {cat.children?.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categorias/${sub.slug}`}
                      className={`group flex items-center gap-2.5 bg-white/80 px-3 py-2.5 sm:p-4 rounded-xl ${colors.accent} transition-all duration-300 hover:shadow-sm`}
                    >
                      <span className={`material-symbols-outlined text-lg sm:text-xl shrink-0 ${colors.icon.split(" ")[1]}`}>
                        {sub.icon}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-on-surface group-hover:text-on-surface transition-colors">
                        {sub.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
