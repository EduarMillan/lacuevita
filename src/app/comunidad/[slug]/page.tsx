import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { regions } from "@/lib/regions";

export const dynamic = "force-dynamic";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
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

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { prisma } = await import("@/lib/db");

  const professional = await prisma.professional.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true,
          avatarUrl: true,
          isVerified: true,
          memberSince: true,
        },
      },
      category: { select: { name: true, slug: true, icon: true } },
    },
  });

  if (!professional || !professional.isActive) {
    notFound();
  }

  const regionData = regions.find((r) => r.id === professional.region);
  const comunaData = regionData?.comunas.find(
    (c) => c.id === professional.comuna,
  );

  const initials = professional.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Hero header */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-6 lg:px-8 py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Comunidad", href: "/comunidad" },
              { label: professional.title },
            ]}
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile header */}
            <div className="bg-surface-lowest rounded-2xl p-8">
              <div className="flex items-start gap-5 mb-6">
                {professional.user.avatarUrl ? (
                  <Image
                    src={professional.user.avatarUrl}
                    alt={professional.user.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-surface-low"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-bold text-2xl">
                    {initials}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black text-on-surface">
                      {professional.user.name}
                    </h1>
                    {professional.isVerified && (
                      <span
                        className="material-symbols-outlined text-primary text-xl"
                        style={{
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        verified
                      </span>
                    )}
                  </div>
                  <p className="text-primary font-bold text-lg">
                    {professional.title}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Miembro desde{" "}
                    {professional.user.memberSince.toLocaleDateString("es-CU", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {professional.yearsExperience > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                    <span className="material-symbols-outlined text-base">
                      workspace_premium
                    </span>
                    {professional.yearsExperience}{" "}
                    {professional.yearsExperience === 1 ? "año" : "años"} de
                    experiencia
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-surface-low text-on-surface-variant px-3 py-1.5 rounded-full text-sm font-medium">
                  <span className="material-symbols-outlined text-base">
                    location_on
                  </span>
                  {comunaData?.name || professional.comuna || professional.location}
                  {regionData ? `, ${regionData.shortName}` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-surface-low text-on-surface-variant px-3 py-1.5 rounded-full text-sm font-medium">
                  <span className="material-symbols-outlined text-base">
                    schedule
                  </span>
                  Publicado {timeAgo(professional.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface-lowest rounded-2xl p-8">
              <h2 className="text-lg font-bold text-on-surface mb-4">
                Sobre mis servicios
              </h2>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                {professional.description}
              </p>
            </div>
          </div>

          {/* Sidebar - Contact */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="bg-surface-lowest rounded-2xl p-6 sticky top-[96px]">
              <h3 className="text-lg font-bold text-on-surface mb-5">
                Contactar
              </h3>

              <div className="space-y-3">
                {professional.phone && (
                  <a
                    href={`tel:${professional.phone}`}
                    className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined">call</span>
                    <span className="text-sm">Llamar</span>
                  </a>
                )}

                {professional.whatsapp && (
                  <a
                    href={`https://wa.me/${professional.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    <span className="text-sm">WhatsApp</span>
                  </a>
                )}

              </div>
            </div>

            {/* Safety tips */}
            <div className="bg-tertiary-fixed/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-tertiary">
                  shield
                </span>
                <h3 className="font-bold text-on-surface text-sm">
                  Consejos de seguridad
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-tertiary mt-0.5">
                    check_circle
                  </span>
                  Verifica la identidad del profesional antes de contratar.
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-tertiary mt-0.5">
                    check_circle
                  </span>
                  Pide referencias o trabajos anteriores.
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-tertiary mt-0.5">
                    check_circle
                  </span>
                  Acuerda el precio y condiciones antes de iniciar el trabajo.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
