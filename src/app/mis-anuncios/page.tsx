import Breadcrumbs from "@/components/ui/Breadcrumbs";
import MyListings from "@/components/mis-anuncios/MyListings";

export const metadata = {
  title: "Mis Anuncios | La Cuevita",
  description: "Gestiona tus anuncios publicados en La Cuevita.",
};

export default async function MisAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; cat?: string }>;
}) {
  const { nuevo, cat } = await searchParams;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-400 via-cyan-400 to-sky-400">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Mis Anuncios" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-teal-900 text-lg">
                list_alt
              </span>
              <span className="text-sm font-semibold text-teal-900 tracking-wide">
                Panel de gestión
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              Mis <span className="text-sky-800">Anuncios</span>
            </h1>
            <p className="text-sm sm:text-lg text-teal-900/80 max-w-xl leading-relaxed">
              Administra tus publicaciones. Edita, pausa o elimina tus anuncios.
            </p>
          </div>
        </div>
      </section>

      <MyListings newListingCode={nuevo} categorySlug={cat} />
    </>
  );
}
