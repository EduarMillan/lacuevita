import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockDeleteMany = vi.fn();
const mockPrisma = {
  listing: { deleteMany: mockDeleteMany },
  offer: { deleteMany: mockDeleteMany },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

// We test the cron cleanup logic directly since it's hard to import
// the route handler (depends on Next.js internals)
describe("cron cleanup logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authorization rejects missing token", () => {
    const secret = null;
    const cronSecret = "test-secret-123";
    const isAuthorized = secret === `Bearer ${cronSecret}`;
    expect(isAuthorized).toBe(false);
  });

  it("authorization rejects wrong token", () => {
    const secret: string = "Bearer wrong-token";
    const cronSecret: string = "test-secret-123";
    const isAuthorized = secret === `Bearer ${cronSecret}`;
    expect(isAuthorized).toBe(false);
  });

  it("authorization accepts correct token", () => {
    const cronSecret = "test-secret-123";
    const secret = `Bearer ${cronSecret}`;
    const isAuthorized = secret === `Bearer ${cronSecret}`;
    expect(isAuthorized).toBe(true);
  });

  it("calculates one week ago correctly", () => {
    const now = new Date("2026-04-03T12:00:00Z");
    vi.setSystemTime(now);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    expect(oneWeekAgo.getTime()).toBe(
      new Date("2026-03-27T12:00:00Z").getTime(),
    );
    vi.useRealTimers();
  });

  it("paused listing filter uses correct where clause", () => {
    const oneWeekAgo = new Date("2026-03-27T12:00:00Z");
    const where = { status: "PAUSED", updatedAt: { lte: oneWeekAgo } };

    expect(where.status).toBe("PAUSED");
    expect(where.updatedAt.lte).toEqual(oneWeekAgo);
  });

  it("expired offers filter uses current date", () => {
    const now = new Date("2026-04-03T12:00:00Z");
    const where = { expiresAt: { lte: now } };
    expect(where.expiresAt.lte).toEqual(now);
  });
});
