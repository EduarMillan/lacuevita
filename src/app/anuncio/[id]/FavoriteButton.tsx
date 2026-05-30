"use client";

import { useFavorites } from "@/contexts/FavoritesContext";
import { useRouter } from "next/navigation";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const { favoriteIds, toggleFavorite, isLoaded } = useFavorites();
  const router = useRouter();
  const isFavorited = favoriteIds.has(listingId);

  if (!isLoaded) return null;

  async function handleClick() {
    const result = await toggleFavorite(listingId);
    if (result === null) {
      router.push("/auth/login");
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
        isFavorited
          ? "bg-red-50 border-2 border-red-200 text-red-500"
          : "bg-surface-low border-2 border-outline-variant/20 text-on-surface hover:border-red-200 hover:text-red-500"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}` }}
      >
        favorite
      </span>
      {isFavorited ? "Guardado en Favoritos" : "Guardar en Favoritos"}
    </button>
  );
}
