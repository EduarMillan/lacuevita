import { describe, it, expect } from "vitest";

/* ─── timeAgo (same logic used in busqueda and home) ──── */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
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

describe("timeAgo", () => {
  it("returns 'Hace un momento' for < 60 seconds ago", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("Hace un momento");
  });

  it("returns minutes for < 60 minutes", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("Hace 5 min");
  });

  it("returns hours for < 24 hours", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("Hace 3h");
  });

  it("returns 'Ayer' for 1 day ago", () => {
    const date = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("Ayer");
  });

  it("returns days for < 30 days", () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("Hace 10 días");
  });

  it("returns months for >= 30 days", () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("Hace 2 meses");
  });

  it("returns singular 'mes' for 1 month", () => {
    const date = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(date)).toBe("Hace 1 mes");
  });
});

/* ─── Pagination numbers (from busqueda page) ────────── */
function getPaginationNumbers(
  page: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (page > 3) pages.push("...");
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (page < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

describe("getPaginationNumbers", () => {
  it("returns all pages when totalPages <= 7", () => {
    expect(getPaginationNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns [1,2,3,4,5,6,7] for exactly 7 pages", () => {
    expect(getPaginationNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows ellipsis for page 1 of many pages", () => {
    const result = getPaginationNumbers(1, 20);
    expect(result[0]).toBe(1);
    expect(result).toContain("...");
    expect(result[result.length - 1]).toBe(20);
  });

  it("shows ellipsis on both sides for middle page", () => {
    const result = getPaginationNumbers(10, 20);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe("...");
    expect(result).toContain(9);
    expect(result).toContain(10);
    expect(result).toContain(11);
    expect(result[result.length - 1]).toBe(20);
  });

  it("shows no leading ellipsis for page 3", () => {
    const result = getPaginationNumbers(3, 20);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result).toContain(3);
    expect(result).toContain(4);
  });

  it("shows no trailing ellipsis for last pages", () => {
    const result = getPaginationNumbers(19, 20);
    expect(result).toContain(18);
    expect(result).toContain(19);
    expect(result[result.length - 1]).toBe(20);
  });
});

/* ─── Location filter building (from busqueda page) ──── */

interface Region {
  id: string;
  name: string;
  shortName: string;
  comunas: { id: string; name: string }[];
}

function buildLocationFilter(
  regionId: string | null,
  comunaId: string | null,
  regions: Region[],
): { display: string; filter: string } {
  const selectedRegion = regionId
    ? regions.find((r) => r.id === regionId) || null
    : null;
  const selectedComuna =
    selectedRegion && comunaId
      ? selectedRegion.comunas.find((c) => c.id === comunaId) || null
      : null;

  const display = selectedComuna
    ? `${selectedComuna.name}, ${selectedRegion!.shortName}`
    : selectedRegion
      ? selectedRegion.name
      : "Toda Cuba";

  const filter = selectedComuna
    ? selectedComuna.name
    : selectedRegion
      ? selectedRegion.shortName
      : "";

  return { display, filter };
}

const testRegions: Region[] = [
  {
    id: "hab",
    name: "La Habana",
    shortName: "Habana",
    comunas: [
      { id: "vieja", name: "Habana Vieja" },
      { id: "centro", name: "Centro Habana" },
    ],
  },
  {
    id: "mtz",
    name: "Matanzas",
    shortName: "Matanzas",
    comunas: [
      { id: "cardenas", name: "Cárdenas" },
      { id: "matanzas", name: "Matanzas" },
    ],
  },
];

describe("buildLocationFilter", () => {
  it("returns 'Toda Cuba' when no region selected", () => {
    const result = buildLocationFilter(null, null, testRegions);
    expect(result.display).toBe("Toda Cuba");
    expect(result.filter).toBe("");
  });

  it("returns region name for display, shortName for filter", () => {
    const result = buildLocationFilter("hab", null, testRegions);
    expect(result.display).toBe("La Habana");
    expect(result.filter).toBe("Habana");
  });

  it("returns comuna + region for display, comuna name for filter", () => {
    const result = buildLocationFilter("hab", "vieja", testRegions);
    expect(result.display).toBe("Habana Vieja, Habana");
    expect(result.filter).toBe("Habana Vieja");
  });

  it("ignores comuna if region not found", () => {
    const result = buildLocationFilter("unknown", "vieja", testRegions);
    expect(result.display).toBe("Toda Cuba");
    expect(result.filter).toBe("");
  });

  it("ignores comuna if not found in region", () => {
    const result = buildLocationFilter("hab", "unknown", testRegions);
    expect(result.display).toBe("La Habana");
    expect(result.filter).toBe("Habana");
  });
});

/* ─── formatPrice ────────────────────────────────────── */
import { formatPrice } from "@/lib/format";

describe("formatPrice in search context", () => {
  it("formats CUP prices with peso and CUP suffix", () => {
    expect(formatPrice(500000)).toBe("$500,000 CUP");
  });

  it("formats string prices (from API)", () => {
    expect(formatPrice("500000")).toBe("$500,000 CUP");
  });

  it("formats decimal string prices", () => {
    expect(formatPrice("499999.99")).toBe("$500,000 CUP");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0 CUP");
  });

  it("formats USD prices", () => {
    expect(formatPrice(100, "USD")).toBe("USD 100");
  });

  it("formats MLC prices", () => {
    expect(formatPrice(50, "MLC")).toBe("MLC 50");
  });
});
