import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Offer code generation", () => {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function generateOfferCode(): string {
    let code = "OFR-";
    for (let i = 0; i < 6; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
  }

  it("generates code with OFR- prefix", () => {
    const code = generateOfferCode();
    expect(code.startsWith("OFR-")).toBe(true);
  });

  it("generates code with 10 total characters (OFR- + 6)", () => {
    const code = generateOfferCode();
    expect(code.length).toBe(10);
  });

  it("only uses allowed characters (no I, O, 0, 1)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateOfferCode();
      const suffix = code.slice(4);
      expect(suffix).not.toMatch(/[IO01]/);
      expect(suffix).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });

  it("generates unique codes (high probability)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateOfferCode());
    }
    expect(codes.size).toBe(1000);
  });

  it("OFR- prefix differs from listing LC- prefix", () => {
    const offerCode = generateOfferCode();
    expect(offerCode.startsWith("OFR-")).toBe(true);
    expect(offerCode.startsWith("LC-")).toBe(false);
  });
});

describe("Offer promotion admin - validation", () => {
  function validateOfferPromotion(body: Record<string, unknown>) {
    const { offerId, days, amount } = body;

    if (!offerId || !days || !amount) {
      return { error: "Faltan campos: offerId, days, amount", status: 400 };
    }

    return null;
  }

  it("rejects missing fields", () => {
    expect(validateOfferPromotion({})?.status).toBe(400);
    expect(validateOfferPromotion({ offerId: "x" })?.status).toBe(400);
    expect(validateOfferPromotion({ offerId: "x", days: 7 })?.status).toBe(400);
  });

  it("rejects missing offerId", () => {
    const result = validateOfferPromotion({ days: 7, amount: 5000 });
    expect(result?.status).toBe(400);
    expect(result?.error).toContain("offerId");
  });

  it("accepts valid input", () => {
    const result = validateOfferPromotion({ offerId: "x", days: 30, amount: 10000 });
    expect(result).toBeNull();
  });
});

describe("Offer promotion slots (per region)", () => {
  const MAX_FEATURED_PER_REGION = 5;

  function checkAvailability(featuredCount: number) {
    return {
      total: MAX_FEATURED_PER_REGION,
      used: featuredCount,
      available: Math.max(0, MAX_FEATURED_PER_REGION - featuredCount),
    };
  }

  it("shows all slots available when none used", () => {
    expect(checkAvailability(0)).toEqual({ total: 5, used: 0, available: 5 });
  });

  it("shows correct remaining slots", () => {
    expect(checkAvailability(3)).toEqual({ total: 5, used: 3, available: 2 });
  });

  it("shows 0 available when full", () => {
    expect(checkAvailability(5)).toEqual({ total: 5, used: 5, available: 0 });
  });

  it("handles overflow gracefully", () => {
    expect(checkAvailability(7)).toEqual({ total: 5, used: 7, available: 0 });
  });

  it("differs from listing max (8) - offers use 5 per region", () => {
    const listingMax = 8;
    expect(MAX_FEATURED_PER_REGION).toBe(5);
    expect(MAX_FEATURED_PER_REGION).not.toBe(listingMax);
  });
});

describe("Offer promotion endDate calculation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates 7-day promotion", () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const diffDays = Math.round((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it("calculates 15-day promotion", () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 15);
    const diffDays = Math.round((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(15);
  });

  it("calculates 30-day promotion", () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const diffDays = Math.round((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });
});

describe("Offer promotion expiration logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("identifies expired offer promotions", () => {
    const promotions = [
      { id: "1", endDate: "2026-04-05T00:00:00Z", isActive: true },
      { id: "2", endDate: "2026-04-10T00:00:00Z", isActive: true },
      { id: "3", endDate: "2026-03-20T00:00:00Z", isActive: true },
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

  it("does not expire future promotions", () => {
    const promotions = [
      { id: "1", endDate: "2026-05-01T00:00:00Z", isActive: true },
      { id: "2", endDate: "2026-04-20T00:00:00Z", isActive: true },
    ];

    const now = new Date();
    const expired = promotions.filter(
      (p) => p.isActive && new Date(p.endDate) <= now,
    );

    expect(expired).toHaveLength(0);
  });
});

describe("Offer featured ordering", () => {
  it("featured offers sort before non-featured", () => {
    const offers = [
      { id: "1", isFeatured: false, createdAt: "2026-04-06" },
      { id: "2", isFeatured: true, createdAt: "2026-04-04" },
      { id: "3", isFeatured: false, createdAt: "2026-04-05" },
      { id: "4", isFeatured: true, createdAt: "2026-04-06" },
    ];

    const sorted = [...offers].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    expect(sorted.map((o) => o.id)).toEqual(["4", "2", "1", "3"]);
  });

  it("within featured, sorts by date desc", () => {
    const offers = [
      { id: "a", isFeatured: true, createdAt: "2026-04-01" },
      { id: "b", isFeatured: true, createdAt: "2026-04-05" },
    ];

    const sorted = [...offers].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    expect(sorted.map((o) => o.id)).toEqual(["b", "a"]);
  });

  it("non-featured also sort by date desc", () => {
    const offers = [
      { id: "x", isFeatured: false, createdAt: "2026-04-02" },
      { id: "y", isFeatured: false, createdAt: "2026-04-06" },
    ];

    const sorted = [...offers].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    expect(sorted.map((o) => o.id)).toEqual(["y", "x"]);
  });
});

describe("Offer featured days remaining", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function featuredDaysLeft(endDateStr: string): number {
    return Math.max(
      0,
      Math.ceil(
        (new Date(endDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
  }

  it("calculates days remaining correctly", () => {
    expect(featuredDaysLeft("2026-04-13T12:00:00Z")).toBe(7);
  });

  it("returns 0 for expired", () => {
    expect(featuredDaysLeft("2026-04-01T00:00:00Z")).toBe(0);
  });

  it("returns 1 for tomorrow", () => {
    expect(featuredDaysLeft("2026-04-07T12:00:00Z")).toBe(1);
  });
});

describe("Offer eligibility for promotion", () => {
  it("non-featured offer with future expiry can be promoted", () => {
    const offer = { isFeatured: false, expiresAt: "2026-04-20T00:00:00Z" };
    const now = new Date("2026-04-06T12:00:00Z");
    const canPromote = !offer.isFeatured && new Date(offer.expiresAt) > now;
    expect(canPromote).toBe(true);
  });

  it("already featured offer cannot be promoted", () => {
    const offer = { isFeatured: true, expiresAt: "2026-04-20T00:00:00Z" };
    const now = new Date("2026-04-06T12:00:00Z");
    const canPromote = !offer.isFeatured && new Date(offer.expiresAt) > now;
    expect(canPromote).toBe(false);
  });

  it("expired offer cannot be promoted", () => {
    const offer = { isFeatured: false, expiresAt: "2026-04-01T00:00:00Z" };
    const now = new Date("2026-04-06T12:00:00Z");
    const canPromote = !offer.isFeatured && new Date(offer.expiresAt) > now;
    expect(canPromote).toBe(false);
  });
});

describe("WhatsApp URL builder for offers", () => {
  const PLANS = [
    { days: 7, price: "$500 CUP", label: "7 días" },
    { days: 15, price: "$900 CUP", label: "15 días" },
    { days: 30, price: "$1500 CUP", label: "30 días" },
  ];

  function buildWhatsAppUrl(code: string, title: string, planIndex: number) {
    const plan = PLANS[planIndex];
    const phone = "5350000000";
    const message = encodeURIComponent(
      `Hola! Quiero destacar mi oferta:\n\n` +
      `Codigo: ${code}\n` +
      `Titulo: ${title}\n` +
      `Plan: ${plan.label} (${plan.price})\n\n` +
      `Quedo atento, gracias!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  it("includes offer code in message", () => {
    const url = buildWhatsAppUrl("OFR-ABC123", "2x1 en Pizzas", 0);
    expect(url).toContain("OFR-ABC123");
  });

  it("includes offer title in message", () => {
    const url = buildWhatsAppUrl("OFR-ABC123", "2x1 en Pizzas", 0);
    expect(url).toContain("Pizzas");
  });

  it("includes selected plan info", () => {
    const url = buildWhatsAppUrl("OFR-ABC123", "Test", 1);
    expect(url).toContain("15");
    expect(url).toContain("900");
  });

  it("uses wa.me domain", () => {
    const url = buildWhatsAppUrl("OFR-ABC123", "Test", 0);
    expect(url.startsWith("https://wa.me/")).toBe(true);
  });

  it("includes phone number", () => {
    const url = buildWhatsAppUrl("OFR-ABC123", "Test", 0);
    expect(url).toContain("5350000000");
  });

  it("encodes special characters", () => {
    const url = buildWhatsAppUrl("OFR-ABC123", "Oferta especial & más", 2);
    // Should be encoded, not raw & in URL
    expect(url).not.toContain("&m");
    expect(url).toContain(encodeURIComponent("&"));
  });
});
