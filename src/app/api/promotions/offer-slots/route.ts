import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FEATURED_PER_REGION = 5;

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get("region");

  if (!region) {
    return NextResponse.json(
      { error: "Parámetro 'region' requerido" },
      { status: 400 },
    );
  }

  const { prisma } = await import("@/lib/db");

  const used = await prisma.offer.count({
    where: {
      region,
      isFeatured: true,
      expiresAt: { gt: new Date() },
    },
  });

  const available = Math.max(0, MAX_FEATURED_PER_REGION - used);

  let nextSlotDate: string | null = null;
  if (available === 0) {
    const earliest = await prisma.offerPromotion.findFirst({
      where: {
        isActive: true,
        offer: {
          region,
          isFeatured: true,
          expiresAt: { gt: new Date() },
        },
      },
      orderBy: { endDate: "asc" },
      select: { endDate: true },
    });
    if (earliest) {
      nextSlotDate = earliest.endDate.toISOString();
    }
  }

  return NextResponse.json({
    total: MAX_FEATURED_PER_REGION,
    used,
    available,
    nextSlotDate,
  });
}
