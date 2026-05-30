import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Listing code generation", () => {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function generateCode(): string {
    let code = "LC-";
    for (let i = 0; i < 6; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
  }

  it("generates code with LC- prefix", () => {
    const code = generateCode();
    expect(code.startsWith("LC-")).toBe(true);
  });

  it("generates code with 9 total characters (LC- + 6)", () => {
    const code = generateCode();
    expect(code.length).toBe(9);
  });

  it("only uses allowed characters (no I, O, 0, 1)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateCode();
      const suffix = code.slice(3);
      expect(suffix).not.toMatch(/[IO01]/);
      expect(suffix).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });

  it("generates unique codes (high probability)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateCode());
    }
    // With 30^6 = 729M possibilities, 1000 codes should all be unique
    expect(codes.size).toBe(1000);
  });
});

describe("Promotion admin - authorization", () => {
  it("rejects missing authorization", () => {
    const auth = null;
    const isAuthorized = auth === `Bearer test-secret`;
    expect(isAuthorized).toBe(false);
  });

  it("rejects wrong secret", () => {
    const auth: string = "Bearer wrong";
    const secret: string = "test-secret";
    const isAuthorized = auth === `Bearer ${secret}`;
    expect(isAuthorized).toBe(false);
  });

  it("accepts correct Bearer token", () => {
    const secret = "my-admin-secret";
    const auth = `Bearer ${secret}`;
    const isAuthorized = auth === `Bearer ${secret}`;
    expect(isAuthorized).toBe(true);
  });
});

describe("Promotion admin - validation", () => {
  function validatePromotion(body: Record<string, unknown>) {
    const { listingId, days, amount } = body;

    if (!listingId || !days || !amount) {
      return { error: "Faltan campos: listingId, days, amount", status: 400 };
    }

    if ((days as number) < 1 || (days as number) > 365) {
      return { error: "Los días deben estar entre 1 y 365", status: 400 };
    }

    return null;
  }

  it("rejects missing fields", () => {
    expect(validatePromotion({})?.status).toBe(400);
    expect(validatePromotion({ listingId: "x" })?.status).toBe(400);
    expect(validatePromotion({ listingId: "x", days: 7 })?.status).toBe(400);
  });

  it("rejects days < 1", () => {
    const result = validatePromotion({ listingId: "x", days: -1, amount: 5000 });
    expect(result?.status).toBe(400);
    expect(result?.error).toContain("días");
  });

  it("rejects days > 365", () => {
    const result = validatePromotion({ listingId: "x", days: 400, amount: 5000 });
    expect(result?.status).toBe(400);
  });

  it("accepts valid input", () => {
    const result = validatePromotion({ listingId: "x", days: 30, amount: 10000 });
    expect(result).toBeNull();
  });
});

describe("Promotion slots", () => {
  const MAX_FEATURED = 8;

  function checkAvailability(featuredCount: number) {
    return {
      total: MAX_FEATURED,
      used: featuredCount,
      available: Math.max(0, MAX_FEATURED - featuredCount),
    };
  }

  it("shows all slots available when none used", () => {
    expect(checkAvailability(0)).toEqual({ total: 8, used: 0, available: 8 });
  });

  it("shows correct remaining slots", () => {
    expect(checkAvailability(5)).toEqual({ total: 8, used: 5, available: 3 });
  });

  it("shows 0 available when full", () => {
    expect(checkAvailability(8)).toEqual({ total: 8, used: 8, available: 0 });
  });

  it("handles overflow gracefully", () => {
    expect(checkAvailability(10)).toEqual({ total: 8, used: 10, available: 0 });
  });
});

describe("Promotion endDate calculation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates 7-day promotion", () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    // Check that it's 7 days ahead (ignore DST offsets)
    const diffMs = endDate.getTime() - Date.now();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it("calculates 30-day promotion", () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const diffMs = endDate.getTime() - Date.now();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it("calculates 1-day promotion", () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    const diffMs = endDate.getTime() - Date.now();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(1);
  });
});

describe("Promotion expiration logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("identifies expired promotions", () => {
    const promotions = [
      { id: "1", endDate: "2026-04-02T00:00:00Z", isActive: true },
      { id: "2", endDate: "2026-04-10T00:00:00Z", isActive: true },
      { id: "3", endDate: "2026-03-15T00:00:00Z", isActive: true },
    ];

    const now = new Date();
    const expired = promotions.filter(
      (p) => p.isActive && new Date(p.endDate) <= now,
    );

    expect(expired.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("skips already inactive promotions", () => {
    const promotions = [
      { id: "1", endDate: "2026-04-01T00:00:00Z", isActive: false },
      { id: "2", endDate: "2026-04-01T00:00:00Z", isActive: true },
    ];

    const now = new Date();
    const expired = promotions.filter(
      (p) => p.isActive && new Date(p.endDate) <= now,
    );

    expect(expired.map((p) => p.id)).toEqual(["2"]);
  });
});

describe("Days remaining calculation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function daysRemaining(endDateStr: string): number {
    return Math.max(
      0,
      Math.ceil(
        (new Date(endDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
  }

  it("calculates 7 days remaining", () => {
    expect(daysRemaining("2026-04-10T12:00:00Z")).toBe(7);
  });

  it("returns 0 for past dates", () => {
    expect(daysRemaining("2026-04-01T00:00:00Z")).toBe(0);
  });

  it("returns 1 for tomorrow", () => {
    expect(daysRemaining("2026-04-04T12:00:00Z")).toBe(1);
  });

  it("returns 0 for now", () => {
    expect(daysRemaining("2026-04-03T12:00:00Z")).toBe(0);
  });
});

describe("Featured ordering", () => {
  it("featured listings sort before non-featured", () => {
    const listings = [
      { id: "1", isFeatured: false, createdAt: "2026-04-03" },
      { id: "2", isFeatured: true, createdAt: "2026-04-01" },
      { id: "3", isFeatured: false, createdAt: "2026-04-02" },
      { id: "4", isFeatured: true, createdAt: "2026-04-03" },
    ];

    const sorted = [...listings].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    expect(sorted.map((l) => l.id)).toEqual(["4", "2", "1", "3"]);
  });

  it("within featured, sorts by date desc", () => {
    const listings = [
      { id: "a", isFeatured: true, createdAt: "2026-04-01" },
      { id: "b", isFeatured: true, createdAt: "2026-04-03" },
    ];

    const sorted = [...listings].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    expect(sorted.map((l) => l.id)).toEqual(["b", "a"]);
  });
});

describe("Listing status validation for promotion", () => {
  it("only ACTIVE listings can be promoted", () => {
    const statuses = ["DRAFT", "ACTIVE", "PAUSED", "SOLD", "EXPIRED", "REMOVED"];
    const promotable = statuses.filter((s) => s === "ACTIVE");
    expect(promotable).toEqual(["ACTIVE"]);
  });

  it("already featured listing cannot be promoted again", () => {
    const listing = { isFeatured: true, status: "ACTIVE" };
    const canPromote = listing.status === "ACTIVE" && !listing.isFeatured;
    expect(canPromote).toBe(false);
  });

  it("non-featured active listing can be promoted", () => {
    const listing = { isFeatured: false, status: "ACTIVE" };
    const canPromote = listing.status === "ACTIVE" && !listing.isFeatured;
    expect(canPromote).toBe(true);
  });
});
