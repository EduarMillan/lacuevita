"use client";

import { useEffect, useState } from "react";
import { formatPrice, type Currency } from "@/lib/format";

export type PlanType = "LISTING_FEATURED" | "OFFER_FEATURED" | "BANNER" | "ADULT_FEATURED";

export interface Plan {
  id: string;
  type: PlanType;
  days: number;
  amount: number;
  currency: Currency;
  label: string | null;
  note: string | null;
  isActive: boolean;
  order: number;
}

export interface PlanDisplay {
  id: string;
  days: number;
  label: string;
  price: string; // formatted "$500 CUP"
  amount: number;
  currency: Currency;
}

const CACHE_KEY = "lacuevita_pricing_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

type GroupedPlans = Record<PlanType, Plan[]>;

interface CacheEntry {
  ts: number;
  plans: GroupedPlans;
}

function readCache(): GroupedPlans | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.plans;
  } catch {
    return null;
  }
}

function writeCache(plans: GroupedPlans) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), plans } satisfies CacheEntry),
    );
  } catch {
    // ignore quota errors
  }
}

/**
 * Fetches pricing plans from /api/pricing, returns plans of a specific type
 * formatted for display. Cached in sessionStorage for 5 minutes.
 */
export function usePricingPlans(type: PlanType): {
  plans: PlanDisplay[];
  loading: boolean;
  error: string;
} {
  const [grouped, setGrouped] = useState<GroupedPlans | null>(() => readCache());
  const [loading, setLoading] = useState(grouped === null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (grouped !== null) return;
    let alive = true;
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data: { plans: GroupedPlans }) => {
        if (!alive) return;
        // Normalize numeric amount (Prisma Decimal arrives as string)
        const normalized: GroupedPlans = {
          LISTING_FEATURED: [],
          OFFER_FEATURED: [],
          BANNER: [],
          ADULT_FEATURED: [],
        };
        for (const t of Object.keys(data.plans) as PlanType[]) {
          normalized[t] = (data.plans[t] || []).map((p) => ({
            ...p,
            amount: typeof p.amount === "string" ? parseFloat(p.amount) : p.amount,
          }));
        }
        setGrouped(normalized);
        writeCache(normalized);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : "Error al cargar planes");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [grouped]);

  const plans: PlanDisplay[] = (grouped?.[type] ?? [])
    .slice()
    .sort((a, b) => a.order - b.order || a.days - b.days)
    .map((p) => ({
      id: p.id,
      days: p.days,
      label: p.label || `${p.days} días`,
      price: formatPrice(p.amount, p.currency),
      amount: p.amount,
      currency: p.currency,
    }));

  return { plans, loading, error };
}
