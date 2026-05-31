import CategoryCard, { CategoryCardStyles } from "@/components/ui/CategoryCard";
import BannerCarousel from "@/components/ui/BannerCarousel";
import PagePeel from "@/components/ui/PagePeel";
import RecentListings from "@/components/home/RecentListings";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { prisma } = await import("@/lib/db");

  const [recentListings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 40,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden hero-bg-vibrant">
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              {/* Brand name as hero element */}
              <div className="mb-4 sm:mb-5">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary/5 border border-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
                  <span
                    className="material-symbols-outlined text-primary text-base sm:text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    storefront
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-primary tracking-wide">
                    Marketplace comunitario
                  </span>
                </div>

                <h1 className="leading-none">
                  <span className="block text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[0.15em] text-teal-600 mb-1">
                    Tu
                  </span>
                  <span className="block text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter bg-linear-to-r from-teal-700 via-primary to-cyan-600 bg-clip-text text-transparent leading-none pb-3">
                    Cuevita
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-xl text-on-surface-variant mb-6 sm:mb-10 max-w-lg leading-relaxed font-medium">
                Compra, vende e intercambia productos nuevos y usados,
                servicios y mucho más con vecinos de toda Cuba.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/publicar"
                  className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-teal-500 text-on-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg shadow-[0_8px_30px_-6px_rgba(0,106,99,0.4)] hover:shadow-[0_12px_40px_-6px_rgba(0,106,99,0.5)] active:scale-[0.97] transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">
                    add_circle
                  </span>{" "}
                  <span>Publicar Anuncio</span>
                </Link>
                <Link
                  href="/busqueda"
                  className="inline-flex items-center gap-2 bg-surface-lowest text-on-surface px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg shadow-sm hover:shadow-lg border border-outline-variant/20 hover:border-primary/30 active:scale-[0.97] transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl text-primary">
                    search
                  </span>{" "}
                  <span>Explorar</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-5 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-outline-variant/15">
                <div>
                  <div className="text-lg sm:text-2xl font-black text-primary flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-lg sm:text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>{" "}
                    <span>Fácil</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Publica rápido
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-primary flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-lg sm:text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      shield
                    </span>{" "}
                    <span>Seguro</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Verificado
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-primary flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-lg sm:text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>{" "}
                    <span>Local</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Tu barrio
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative pb-8 lg:pb-0">
              <div className="relative group">
                <div className="absolute -inset-4 bg-linear-to-r from-teal-400 via-cyan-400 to-teal-300 rounded-[2rem] lg:rounded-[3.5rem] blur-2xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-500" />
                <div className="aspect-[4/3] sm:aspect-[4/3] lg:aspect-4/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] lg:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] relative bg-white border-4 lg:border-[6px] border-white lg:rotate-2 transform transition-all hover:rotate-0 hover:scale-[1.02] duration-700">
                  <Image
                    src="/imagen_portada.avif"
                    alt="La Cuevita - Marketplace de la comunidad"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                    className="object-cover saturate-[1.15] contrast-[1.05]"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-2 lg:-bottom-6 lg:-left-12 bg-linear-to-r from-orange-400 via-orange-500 to-amber-600 text-white p-4 lg:p-7 rounded-2xl lg:rounded-4xl shadow-[0_15px_30px_-6px_rgba(234,88,12,0.5)] lg:shadow-[0_30px_60px_-12px_rgba(234,88,12,0.5)] border-2 lg:border-4 border-white transform -rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="flex items-center gap-1.5 lg:gap-2 mb-1">
                  <span
                    className="material-symbols-outlined text-xl lg:text-3xl text-white drop-shadow-md"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <div className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] text-orange-100">
                    Comunidad
                  </div>
                </div>
                <div className="text-base lg:text-2xl font-black text-white leading-tight drop-shadow-sm">
                  Vendedores
                  <br />
                  <span className="text-orange-100">Verificados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="relative">
        <PagePeel />
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-10 group">
          <BannerCarousel />
        </div>
      </section>

      {/* Categories */}
      <section className="bg-surface-low py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-2">
                Explora por Categoría
              </h2>
              <div className="w-16 sm:w-20 h-1.5 bg-linear-to-r from-primary to-primary-container rounded-full" />
            </div>
            <Link
              href="/categorias"
              className="text-primary font-bold text-sm sm:text-base hover:underline underline-offset-8 transition-all"
            >
              Ver todo
            </Link>
          </div>
          <CategoryCardStyles />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-6">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.slug}
                slug={cat.slug}
                icon={cat.icon}
                name={cat.name}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Ads */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-12 gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
            Anuncios Recientes
          </h2>
        </div>

        {recentListings.length > 0 ? (
          <RecentListings
            initialListings={recentListings.map((l) => ({
              ...l,
              price: String(l.price),
              createdAt: l.createdAt.toISOString(),
              images: l.images.map((img) => ({ url: img.url })),
            }))}
            totalCount={totalCount}
          />
        ) : (
          <div className="text-center py-10 sm:py-16 px-4">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-on-surface-variant/30 mb-4 block">
              inventory_2
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">
              Aún no hay anuncios
            </h3>
            <p className="text-sm sm:text-base text-on-surface-variant mb-6">
              Sé el primero en publicar algo en la comunidad.
            </p>
            <Link
              href="/publicar"
              className="inline-flex bg-linear-to-r from-primary to-primary-container text-on-primary px-6 sm:px-8 py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base"
            >
              Publicar Anuncio
            </Link>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-20">
        <div className="max-w-7xl mx-auto bg-linear-to-r from-primary to-primary-container p-8 sm:p-12 lg:p-20 rounded-2xl sm:rounded-[3rem] text-on-primary flex flex-col items-center text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 relative z-10">
            ¿Tienes algo que ya no usas?
          </h2>
          <p className="text-sm sm:text-xl text-primary-fixed max-w-2xl mb-8 sm:mb-12 relative z-10 opacity-90">
            Únete a miles de personas que están renovando sus espacios y ganando
            dinero extra de forma fácil y segura.
          </p>
          <Link
            href="/publicar"
            className="bg-white text-primary px-8 sm:px-10 py-3 sm:py-4 rounded-full font-black text-base sm:text-lg shadow-2xl active:scale-95 transition-all relative z-10"
          >
            Publicar Anuncio Ahora
          </Link>
        </div>
      </section>
    </>
  );
}
