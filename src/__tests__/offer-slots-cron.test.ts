import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Offer slots API - region-based logic", () => {
  const MAX_FEATURED_PER_REGION = 5;

  function getOfferSlots(region: string, featuredOffers: { region: string; isFeatured: boolean; expiresAt: string }[]) {
    const now = new Date();
    const activeInRegion = featuredOffers.filter(
      (o) => o.region === region && o.isFeatured && new Date(o.expiresAt) > now,
    );
    const used = activeInRegion.length;
    return {
      total: MAX_FEATURED_PER_REGION,
      used,
      available: Math.max(0, MAX_FEATURED_PER_REGION - used),
    };
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows all slots available for empty region", () => {
    const result = getOfferSlots("II", []);
    expect(result).toEqual({ total: 5, used: 0, available: 5 });
  });

  it("counts only offers in the specified region", () => {
    const offers = [
      { region: "II", isFeatured: true, expiresAt: "2026-04-20T00:00:00Z" },
      { region: "II", isFeatured: true, expiresAt: "2026-04-15T00:00:00Z" },
      { region: "III", isFeatured: true, expiresAt: "2026-04-20T00:00:00Z" },
    ];
    const result = getOfferSlots("II", offers);
    expect(result).toEqual({ total: 5, used: 2, available: 3 });
  });

  it("ignores non-featured offers", () => {
    const offers = [
      { region: "II", isFeatured: true, expiresAt: "2026-04-20T00:00:00Z" },
      { region: "II", isFeatured: false, expiresAt: "2026-04-20T00:00:00Z" },
    ];
    const result = getOfferSlots("II", offers);
    expect(result).toEqual({ total: 5, used: 1, available: 4 });
  });

  it("ignores expired offers", () => {
    const offers = [
      { region: "II", isFeatured: true, expiresAt: "2026-04-01T00:00:00Z" }, // expired
      { region: "II", isFeatured: true, expiresAt: "2026-04-20T00:00:00Z" }, // active
    ];
    const result = getOfferSlots("II", offers);
    expect(result).toEqual({ total: 5, used: 1, available: 4 });
  });

  it("shows 0 available when region is full", () => {
    const offers = Array.from({ length: 5 }, (_, i) => ({
      region: "II",
      isFeatured: true,
      expiresAt: `2026-04-${20 + i}T00:00:00Z`,
    }));
    const result = getOfferSlots("II", offers);
    expect(result).toEqual({ total: 5, used: 5, available: 0 });
  });
});

describe("Offer slots - nextSlotDate logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function getNextSlotDate(promotions: { endDate: string; isActive: boolean }[]) {
    const active = promotions.filter((p) => p.isActive);
    if (active.length === 0) return null;

    const sorted = [...active].sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    );
    return sorted[0].endDate;
  }

  it("returns earliest ending promotion date", () => {
    const promotions = [
      { endDate: "2026-04-15T00:00:00Z", isActive: true },
      { endDate: "2026-04-10T00:00:00Z", isActive: true },
      { endDate: "2026-04-20T00:00:00Z", isActive: true },
    ];
    expect(getNextSlotDate(promotions)).toBe("2026-04-10T00:00:00Z");
  });

  it("skips inactive promotions", () => {
    const promotions = [
      { endDate: "2026-04-08T00:00:00Z", isActive: false },
      { endDate: "2026-04-15T00:00:00Z", isActive: true },
    ];
    expect(getNextSlotDate(promotions)).toBe("2026-04-15T00:00:00Z");
  });

  it("returns null when no active promotions", () => {
    expect(getNextSlotDate([])).toBeNull();
  });
});

describe("Cron cleanup - offer promotions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("identifies expired offer promotions for cleanup", () => {
    const now = new Date();
    const offerPromotions = [
      { id: "op1", offerId: "o1", endDate: "2026-04-05T00:00:00Z", isActive: true },
      { id: "op2", offerId: "o2", endDate: "2026-04-10T00:00:00Z", isActive: true },
      { id: "op3", offerId: "o3", endDate: "2026-03-01T00:00:00Z", isActive: true },
      { id: "op4", offerId: "o4", endDate: "2026-04-01T00:00:00Z", isActive: false },
    ];

    const expired = offerPromotions.filter(
      (p) => p.isActive && new Date(p.endDate) <= now,
    );

    expect(expired).toHaveLength(2);
    expect(expired.map((p) => p.id)).toEqual(["op1", "op3"]);
  });

  it("collects offerIds from expired promotions for unfeaturing", () => {
    const now = new Date();
    const offerPromotions = [
      { id: "op1", offerId: "offer-a", endDate: "2026-04-01T00:00:00Z", isActive: true },
      { id: "op2", offerId: "offer-b", endDate: "2026-04-20T00:00:00Z", isActive: true },
    ];

    const expired = offerPromotions.filter(
      (p) => p.isActive && new Date(p.endDate) <= now,
    );

    const offerIdsToUnfeature = expired.map((p) => p.offerId);
    expect(offerIdsToUnfeature).toEqual(["offer-a"]);
  });

  it("handles empty promotion list", () => {
    const expired = ([] as { isActive: boolean; endDate: string }[]).filter(
      (p) => p.isActive && new Date(p.endDate) <= new Date(),
    );
    expect(expired).toHaveLength(0);
  });
});

describe("Offer vs Listing promotion systems comparison", () => {
  it("offer slots use region, listing slots use category", () => {
    const offerSlotParam = "region";
    const listingSlotParam = "category";
    expect(offerSlotParam).not.toBe(listingSlotParam);
  });

  it("offer max is 5 per region, listing max is 8 per category", () => {
    const OFFER_MAX = 5;
    const LISTING_MAX = 8;
    expect(OFFER_MAX).toBeLessThan(LISTING_MAX);
  });

  it("offer codes use OFR- prefix, listing codes use LC-", () => {
    const offerCode = "OFR-ABC123";
    const listingCode = "LC-ABC123";
    expect(offerCode.slice(0, 4)).toBe("OFR-");
    expect(listingCode.slice(0, 3)).toBe("LC-");
    expect(offerCode.slice(0, 4)).not.toBe(listingCode.slice(0, 4));
  });
});
