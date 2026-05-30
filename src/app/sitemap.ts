import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { categories } from "@/lib/categories";

export const revalidate = 3600;

const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/categorias", changeFrequency: "weekly", priority: 0.8 },
  { path: "/busqueda", changeFrequency: "daily", priority: 0.7 },
  { path: "/ofertas", changeFrequency: "daily", priority: 0.7 },
  { path: "/comunidad", changeFrequency: "weekly", priority: 0.5 },
  { path: "/ayuda", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terminos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const parent = {
      url: `${SITE_URL}/categorias/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
    const children = (cat.children ?? []).map((sub) => ({
      url: `${SITE_URL}/categorias/${sub.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [parent, ...children];
  });

  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/db");
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 45000,
    });

    listingEntries = listings.map((l) => ({
      url: `${SITE_URL}/anuncio/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
      images: l.images[0]?.url ? [l.images[0].url] : undefined,
    }));
  } catch (err) {
    console.error("[sitemap] failed to fetch listings", err);
  }

  return [...staticEntries, ...categoryEntries, ...listingEntries];
}
