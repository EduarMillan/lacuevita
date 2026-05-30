import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductCard from "@/components/ui/ProductCard";
import { getCategoryBySlug } from "@/lib/categories";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

import { formatPrice } from "@/lib/format";

const ADULT_SLUGS = new Set(["adultos"]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoría no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const parentSlug = "parent" in category ? category.parent?.slug : undefined;
  const isAdult = ADULT_SLUGS.has(slug) || (parentSlug && ADULT_SLUGS.has(parentSlug));
  const path = `/categorias/${slug}`;
  const title = `${category.name} — Anuncios de segunda mano`;
  const description = `Encuentra anuncios de ${category.name.toLowerCase()} en ${SITE_NAME}. Publica gratis y compra a vendedores verificados en Cuba.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: isAdult
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) return notFound();

  const isParent = "children" in category && category.children;
  const parentInfo = "parent" in category ? category.parent : null;

  const { prisma } = await import("@/lib/db");

  // Find listings: if parent category, include all subcategory listings too
  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      category: isParent
        ? { OR: [{ slug }, { parent: { slug } }] }
        : { slug },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 20,
  });

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Inicio", href: "/" },
    { label: "Categorías", href: "/categorias" },
  ];
  if (parentInfo) {
    breadcrumbs.push({ label: parentInfo.name, href: `/categorias/${parentInfo.slug}` });
  }
  breadcrumbs.push({ label: category.name });

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

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/anuncio/${l.slug}`),
      name: l.title,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">
            {category.icon}
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            {category.name}
          </h1>
          {parentInfo && (
            <p className="text-on-surface-variant">
              en{" "}
              <Link
                href={`/categorias/${parentInfo.slug}`}
                className="text-primary hover:underline"
              >
                {parentInfo.name}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* If parent category, show subcategories grid */}
      {isParent && category.children && (
        <div className="mb-16">
          <h2 className="text-xl font-bold text-on-surface mb-6">
            Subcategorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {category.children.map((sub) => (
              <Link
                key={sub.slug}
                href={`/categorias/${sub.slug}`}
                className="group flex items-center gap-3 bg-surface-lowest p-4 rounded-xl hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-xl">
                  {sub.icon}
                </span>
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-on-surface">
            Anuncios en {category.name}
            <span className="text-on-surface-variant font-normal text-base ml-2">
              ({listings.length})
            </span>
          </h2>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                id={listing.slug}
                listingId={listing.id}
                title={listing.title}
                price={formatPrice(listing.price as unknown as number, listing.currency as "CUP" | "USD" | "MLC" | undefined)}
                location={listing.location}
                time={timeAgo(listing.createdAt)}
                image={listing.images[0]?.url}
                description={listing.description}
                viewCount={listing.viewCount}
                badges={listing.isFeatured ? [{ label: "Destacado", variant: "featured" as const }] : []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
              inventory_2
            </span>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Aún no hay anuncios en esta categoría
            </h3>
            <p className="text-on-surface-variant mb-8">
              Sé el primero en publicar algo aquí
            </p>
            <Link
              href="/publicar"
              className="inline-flex bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-bold active:scale-95 transition-transform"
            >
              Publicar Anuncio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
