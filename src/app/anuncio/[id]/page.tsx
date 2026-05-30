import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/ui/ProductCard";
import AnuncioGallery from "./AnuncioGallery";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

const conditionConfig: Record<string, { label: string; variant: "new" | "like-new" | "used" | "for-parts"; schema: string }> = {
  NEW: { label: "Nuevo", variant: "new", schema: "https://schema.org/NewCondition" },
  LIKE_NEW: { label: "Como nuevo", variant: "like-new", schema: "https://schema.org/UsedCondition" },
  USED: { label: "Usado", variant: "used", schema: "https://schema.org/UsedCondition" },
  FOR_PARTS: { label: "Para repuestos", variant: "for-parts", schema: "https://schema.org/DamagedCondition" },
};

const safetyTips = [
  {
    icon: "payments",
    text: "No realices pagos adelantados ni transferencias previas a ver el producto.",
  },
  {
    icon: "meeting_room",
    text: "Reúnete en lugares públicos y concurridos para concretar la transacción.",
  },
  {
    icon: "fact_check",
    text: "Revisa la mercancía minuciosamente antes de finalizar la compra.",
  },
];

import { formatPrice } from "@/lib/format";
import FavoriteButton from "./FavoriteButton";

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

const getListing = cache(async (idOrSlug: string) => {
  const { prisma } = await import("@/lib/db");
  return prisma.listing.findFirst({
    where: {
      OR: [{ slug: idOrSlug }, { id: idOrSlug }],
    },
    include: {
      images: { orderBy: { order: "asc" } },
      category: {
        select: {
          name: true,
          slug: true,
          parent: { select: { name: true, slug: true } },
        },
      },
      user: {
        select: {
          name: true,
          avatarUrl: true,
          isVerified: true,
          phone: true,
          memberSince: true,
        },
      },
    },
  });
});

const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|pingdom|uptime|gtmetrix|lighthouse|chrome-lighthouse|headlesschrome/i;

async function isBotRequest(): Promise<boolean> {
  try {
    const h = await headers();
    const ua = h.get("user-agent") ?? "";
    return BOT_UA_REGEX.test(ua);
  } catch {
    return false;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return {
      title: "Anuncio no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const isAdult = listing.category.parent?.slug === "adultos" || listing.category.slug === "adultos";
  const canonicalPath = `/anuncio/${listing.slug}`;
  const primaryImage = listing.images[0]?.url;
  const description =
    listing.description.length > 160
      ? `${listing.description.slice(0, 157)}...`
      : listing.description;

  return {
    title: `${listing.title} — ${formatPrice(listing.price as unknown as number, listing.currency as "CUP" | "USD" | "MLC" | undefined)}`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: isAdult
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: listing.title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      images: primaryImage
        ? [{ url: primaryImage, alt: listing.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
  };
}

export default async function AnuncioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) return notFound();

  if (!(await isBotRequest())) {
    const { prisma } = await import("@/lib/db");
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  const { prisma } = await import("@/lib/db");
  const related = await prisma.listing.findMany({
    where: {
      categoryId: listing.categoryId,
      id: { not: listing.id },
      status: "ACTIVE",
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
    take: 4,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Inicio", href: "/" },
  ];
  if (listing.category.parent) {
    breadcrumbs.push({
      label: listing.category.parent.name,
      href: `/categorias/${listing.category.parent.slug}`,
    });
  }
  breadcrumbs.push({
    label: listing.category.name,
    href: `/categorias/${listing.category.slug}`,
  });
  breadcrumbs.push({ label: listing.title });

  const canonicalUrl = absoluteUrl(`/anuncio/${listing.slug}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    sku: listing.code,
    image: listing.images.map((img) =>
      img.url.startsWith("http") ? img.url : absoluteUrl(img.url)
    ),
    category: listing.category.name,
    itemCondition: conditionConfig[listing.condition]?.schema ?? "https://schema.org/UsedCondition",
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: listing.currency || "CUP",
      price: Number(listing.price),
      availability:
        listing.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: conditionConfig[listing.condition]?.schema ?? "https://schema.org/UsedCondition",
      seller: {
        "@type": "Person",
        name: listing.user.name ?? "Vendedor",
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: listing.location,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.label,
      ...(b.href ? { item: absoluteUrl(b.href) } : {}),
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <AnuncioGallery images={listing.images} title={listing.title} />

          {/* Description */}
          <div className="pt-8 border-t border-outline-variant/15">
            <h3 className="text-xl font-bold mb-4 tracking-tight">
              Descripción del Producto
            </h3>
            <div className="space-y-4 text-on-surface-variant leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Main info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={conditionConfig[listing.condition]?.variant || "secondary"}>
                {conditionConfig[listing.condition]?.label || listing.condition}
              </Badge>
              {listing.user.isVerified && (
                <Badge variant="verified">Vendedor Verificado</Badge>
              )}
              {listing.isFeatured && (
                <Badge variant="featured">Destacado</Badge>
              )}
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tighter">
              {listing.title}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">
                {formatPrice(listing.price as unknown as number, listing.currency as "CUP" | "USD" | "MLC" | undefined)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>tag</span>
                <span>ID:</span>
                <span className="font-mono tracking-wide">{listing.code}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                {listing.location}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                {timeAgo(listing.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  visibility
                </span>
                {listing.viewCount} visitas
              </div>
            </div>
          </div>

          {/* Action card */}
          <div className="bg-surface-lowest rounded-xl p-8 shadow-soft space-y-4">
            {listing.user.phone && (
              <a
                href={`tel:+53${listing.user.phone}`}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">call</span>
                Llamar al Vendedor
              </a>
            )}
            <a
              href={`https://wa.me/53${listing.user.phone?.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <FavoriteButton listingId={listing.id} />
          </div>

          {/* Seller info */}
          <div className="bg-surface-low rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-surface-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">
                  person
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-on-surface">Vendedor</h4>
                  {listing.user.isVerified && (
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant">
                  Miembro desde{" "}
                  {listing.user.memberSince.toLocaleDateString("es-CU", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Safety tips */}
          <div className="bg-white/40 border border-outline-variant/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined">verified_user</span>
              <span>Consejos de Compra Segura</span>
            </div>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              {safetyTips.map((tip) => (
                <li key={tip.icon} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">
                    {tip.icon}
                  </span>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-black mb-8 tracking-tight">
            Otros productos en {listing.category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                id={item.slug}
                listingId={item.id}
                title={item.title}
                price={formatPrice(item.price as unknown as number, item.currency as "CUP" | "USD" | "MLC" | undefined)}
                location={item.location}
                time={timeAgo(item.createdAt)}
                image={item.images[0]?.url}
                viewCount={item.viewCount}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
