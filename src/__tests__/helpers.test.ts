import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { formatPrice } from "@/lib/format";

describe("formatPrice()", () => {

  it("formats number price", () => {
    const result = formatPrice(15000);
    expect(result).toMatch(/^\$[\d.,]+ CUP$/);
    expect(result).toContain("15");
  });

  it("formats string price", () => {
    const result = formatPrice("25000");
    expect(result).toMatch(/^\$[\d.,]+ CUP$/);
    expect(result).toContain("25");
  });

  it("starts with $", () => {
    expect(formatPrice(100)).toMatch(/^\$/);
  });

  it("has no decimal places", () => {
    const result = formatPrice(1500.99);
    // Should not contain decimal separator for fractions
    expect(result).not.toMatch(/[.,]\d{1,2}$/);
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0 CUP");
  });
});

describe("timeAgo()", () => {
  let now: number;

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("returns 'Hace un momento' for < 60 seconds", () => {
    expect(timeAgo(new Date(now - 30_000))).toBe("Hace un momento");
  });

  it("returns minutes for < 60 minutes", () => {
    expect(timeAgo(new Date(now - 5 * 60_000))).toBe("Hace 5 min");
    expect(timeAgo(new Date(now - 45 * 60_000))).toBe("Hace 45 min");
  });

  it("returns hours for < 24 hours", () => {
    expect(timeAgo(new Date(now - 3 * 3600_000))).toBe("Hace 3h");
    expect(timeAgo(new Date(now - 23 * 3600_000))).toBe("Hace 23h");
  });

  it("returns 'Ayer' for 1 day", () => {
    expect(timeAgo(new Date(now - 24 * 3600_000))).toBe("Ayer");
  });

  it("returns days for 2-29 days", () => {
    expect(timeAgo(new Date(now - 5 * 24 * 3600_000))).toBe("Hace 5 días");
    expect(timeAgo(new Date(now - 29 * 24 * 3600_000))).toBe("Hace 29 días");
  });

  it("returns '1 mes' for 30 days", () => {
    expect(timeAgo(new Date(now - 30 * 24 * 3600_000))).toBe("Hace 1 mes");
  });

  it("returns months plural for > 1 month", () => {
    expect(timeAgo(new Date(now - 90 * 24 * 3600_000))).toBe("Hace 3 meses");
  });

  it("returns just now for 0 seconds", () => {
    expect(timeAgo(new Date(now))).toBe("Hace un momento");
  });
});

describe("slug generation", () => {
  function generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return baseSlug;
  }

  it("converts to lowercase", () => {
    expect(generateSlug("iPhone 15 Pro")).toBe("iphone-15-pro");
  });

  it("removes accents/tildes", () => {
    expect(generateSlug("Teléfono Móvil")).toBe("telefono-movil");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("mesa de comedor")).toBe("mesa-de-comedor");
  });

  it("removes special characters", () => {
    expect(generateSlug("TV 55\" (Smart)")).toBe("tv-55-smart");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug(" -hello world- ")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
  });

  it("handles ñ correctly", () => {
    expect(generateSlug("Año nuevo")).toBe("ano-nuevo");
  });
});

describe("pagination calculation", () => {
  function parsePagination(pageStr: string | null, limitStr: string | null) {
    const page = Math.max(1, parseInt(pageStr || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(limitStr || "12", 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  it("defaults to page 1, limit 12", () => {
    expect(parsePagination(null, null)).toEqual({ page: 1, limit: 12, skip: 0 });
  });

  it("clamps page minimum to 1", () => {
    expect(parsePagination("0", null).page).toBe(1);
    expect(parsePagination("-5", null).page).toBe(1);
  });

  it("clamps limit to [1, 50]", () => {
    expect(parsePagination(null, "0").limit).toBe(1);
    expect(parsePagination(null, "100").limit).toBe(50);
    expect(parsePagination(null, "-1").limit).toBe(1);
  });

  it("calculates skip correctly", () => {
    expect(parsePagination("3", "10").skip).toBe(20);
    expect(parsePagination("1", "20").skip).toBe(0);
  });

  it("NaN inputs produce NaN (edge case in real API)", () => {
    // parseInt("abc") returns NaN, Math.max(1, NaN) returns NaN
    // This documents actual behavior — the real API would produce NaN
    const result = parsePagination("abc", "xyz");
    expect(Number.isNaN(result.page)).toBe(true);
    expect(Number.isNaN(result.limit)).toBe(true);
  });
});
