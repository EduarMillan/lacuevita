import { NextResponse } from "next/server";

export const revalidate = 300; // 5 minutes server cache

// GET /api/pricing — public, returns active pricing plans grouped by type
export async function GET() {
  const { prisma } = await import("@/lib/db");

  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { order: "asc" }, { days: "asc" }],
  });

  // Group by type for easy consumption on the client
  const grouped: Record<string, typeof plans> = {
    LISTING_FEATURED: [],
    OFFER_FEATURED: [],
    BANNER: [],
    ADULT_FEATURED: [],
  };

  for (const p of plans) {
    if (grouped[p.type]) grouped[p.type].push(p);
  }

  return NextResponse.json({ plans: grouped });
}
