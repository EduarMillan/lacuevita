import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Find expired listing promotions
  const expiredPromotions = await prisma.promotion.findMany({
    where: { isActive: true, endDate: { lte: now } },
    select: { id: true, listingId: true },
  });

  const promotionCleanup = expiredPromotions.length > 0
    ? Promise.all([
        prisma.promotion.updateMany({
          where: { id: { in: expiredPromotions.map((p) => p.id) } },
          data: { isActive: false },
        }),
        ...expiredPromotions.map((p) =>
          prisma.listing.update({
            where: { id: p.listingId },
            data: { isFeatured: false },
          }),
        ),
      ])
    : Promise.resolve([]);

  // Find expired offer promotions
  const expiredOfferPromotions = await prisma.offerPromotion.findMany({
    where: { isActive: true, endDate: { lte: now } },
    select: { id: true, offerId: true },
  });

  const offerPromotionCleanup = expiredOfferPromotions.length > 0
    ? Promise.all([
        prisma.offerPromotion.updateMany({
          where: { id: { in: expiredOfferPromotions.map((p) => p.id) } },
          data: { isActive: false },
        }),
        ...expiredOfferPromotions.map((p) =>
          prisma.offer.update({
            where: { id: p.offerId },
            data: { isFeatured: false },
          }),
        ),
      ])
    : Promise.resolve([]);

  const [pausedDeleted, offersDeleted, expiredBanners] = await Promise.all([
    prisma.listing.deleteMany({
      where: { status: "PAUSED", updatedAt: { lte: oneWeekAgo } },
    }),
    prisma.offer.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
    prisma.banner.updateMany({
      where: { isActive: true, endDate: { lte: now } },
      data: { isActive: false },
    }),
    promotionCleanup,
    offerPromotionCleanup,
  ]);

  return NextResponse.json({
    pausedListingsDeleted: pausedDeleted.count,
    expiredOffersDeleted: offersDeleted.count,
    expiredPromotions: expiredPromotions.length,
    expiredOfferPromotions: expiredOfferPromotions.length,
    expiredBanners: expiredBanners.count,
  });
}
