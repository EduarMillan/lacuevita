"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  toggleFavorite: (listingId: string) => Promise<boolean | null>;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  toggleFavorite: async () => null,
  isLoaded: false,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/favoritos")
      .then((res) => res.json())
      .then((data: { favoriteIds: string[] }) => {
        setFavoriteIds(new Set(data.favoriteIds));
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const toggleFavorite = useCallback(async (listingId: string): Promise<boolean | null> => {
    const wasFavorited = favoriteIds.has(listingId);

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    try {
      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (res.status === 401) {
        // Revert — user not authenticated
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) {
            next.add(listingId);
          } else {
            next.delete(listingId);
          }
          return next;
        });
        return null;
      }

      const data = await res.json();
      return data.favorited;
    } catch {
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
      return null;
    }
  }, [favoriteIds]);

  return (
    <FavoritesContext value={{ favoriteIds, toggleFavorite, isLoaded }}>
      {children}
    </FavoritesContext>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
