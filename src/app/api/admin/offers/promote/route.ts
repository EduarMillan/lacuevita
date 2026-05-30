import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FEATURED_PER_REGION = 5;

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return user;
}

// POST — Activate offer promotion
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { offerId, days, amount, note } = body;

  if (!offerId || !days || !amount) {
    return NextResponse.json({ error: "Faltan campos: offerId, days, amount" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { id: true, code: true, region: true, isFeatured: true, expiresAt: true },
  });

  if (!offer) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  if (offer.expiresAt <= new Date()) {
    return NextResponse.json({ error: "La oferta ya expiró" }, { status: 400 });
  }

  if (offer.isFeatured) {
    return NextResponse.json({ error: "Esta oferta ya está destacada" }, { status: 400 });
  }

  // Check slots in this region
  const featuredCount = await prisma.offer.count({
    where: {
      region: offer.region,
      isFeatured: true,
      expiresAt: { gt: new Date() },
    },
  });

  if (featuredCount >= MAX_FEATURED_PER_REGION) {
    return NextResponse.json({
      error: `Sin slots disponibles (${featuredCount}/${MAX_FEATURED_PER_REGION} ocupados)`,
    }, { status: 409 });
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));

  const [promotion] = await Promise.all([
    prisma.offerPromotion.create({
      data: {
        offerId,
        endDate,
        amount: parseFloat(amount),
        note: note || null,
      },
    }),
    prisma.offer.update({
      where: { id: offerId },
      data: { isFeatured: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    promotion,
    code: offer.code,
    slotsRemaining: MAX_FEATURED_PER_REGION - featuredCount - 1,
  }, { status: 201 });
}

// DELETE — Remove offer promotion
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const offerId = request.nextUrl.searchParams.get("offerId");

  if (!offerId) {
    return NextResponse.json({ error: "Falta offerId" }, { status: 400 });
  }

  await prisma.offerPromotion.updateMany({
    where: { offerId, isActive: true },
    data: { isActive: false },
  });

  await prisma.offer.update({
    where: { id: offerId },
    data: { isFeatured: false },
  });

  return NextResponse.json({ success: true });
}
