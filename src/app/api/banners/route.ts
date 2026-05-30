import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/db");

  const banners = await prisma.banner.findMany({
    where: {
      isActive: true,
      endDate: { gt: new Date() },
    },
    orderBy: { position: "asc" },
    select: {
      id: true,
      businessName: true,
      imageUrl: true,
      linkUrl: true,
    },
  });

  return NextResponse.json({ banners });
}
