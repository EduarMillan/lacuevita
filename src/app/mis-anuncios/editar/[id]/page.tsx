"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ListingForm, { type ListingData } from "@/components/listings/ListingForm";
import { regions } from "@/lib/regions";
import { isCurrency } from "@/lib/format";

function parseLocation(location: string): { regionId: string; comunaId: string } {
  // location format: "Municipio, ShortName" or just "ShortName"
  const parts = location.split(",").map((p) => p.trim());

  if (parts.length >= 2) {
    const comunaName = parts[0];
    const shortName = parts[1];
    const region = regions.find((r) => r.shortName === shortName);
    if (region) {
      const comuna = region.comunas.find((c) => c.name === comunaName);
      return { regionId: region.id, comunaId: comuna?.id || "" };
    }
  }

  // Fallback: try matching shortName only
  const region = regions.find((r) => r.shortName === parts[0]);
  return { regionId: region?.id || "", comunaId: "" };
}

export default function EditarAnuncioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al cargar el anuncio");
          return;
        }
        const { listing } = await res.json();
        const { regionId, comunaId } = parseLocation(listing.location || "");

        setListingData({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          currency: isCurrency(listing.currency) ? listing.currency : "CUP",
          condition: listing.condition,
          location: listing.location,
          categorySlug: listing.category?.slug || "",
          parentCategorySlug: listing.category?.parent?.slug || "",
          regionId,
          comunaId,
          phone: listing.user?.phone || "",
          images: listing.images.map((img: { id: string; url: string; order: number; isPrimary: boolean }) => ({
            id: img.id,
            url: img.url,
            order: img.order,
            isPrimary: img.isPrimary,
          })),
        });
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-surface-low rounded-xl w-1/3" />
          <div className="h-5 bg-surface-low rounded-lg w-1/2" />
          <div className="bg-surface-low rounded-xl h-64" />
          <div className="bg-surface-low rounded-xl h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center py-16 bg-surface-lowest rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">
            error
          </span>
          <h3 className="text-xl font-bold text-on-surface mb-2">{error}</h3>
          <Link
            href="/mis-anuncios"
            className="inline-flex items-center gap-2 text-primary font-semibold mt-4 hover:underline"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver a Mis Anuncios
          </Link>
        </div>
      </div>
    );
  }

  return <ListingForm mode="edit" initialData={listingData!} />;
}
