import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FEATURED_PER_CATEGORY = 8;

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return user;
}

// POST — Activate promotion
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { listingId, days, amount, note } = body;

  if (!listingId || !days || !amount) {
    return NextResponse.json({ error: "Faltan campos: listingId, days, amount" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { category: { select: { id: true, parentId: true } } },
  });

  if (!listing) {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  if (listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Solo se pueden destacar anuncios activos" }, { status: 400 });
  }

  if (listing.isFeatured) {
    return NextResponse.json({ error: "Este anuncio ya está destacado" }, { status: 400 });
  }

  // Check slots
  const categoryId = listing.category.id;
  const parentId = listing.category.parentId;

  const featuredCount = await prisma.listing.count({
    where: {
      status: "ACTIVE",
      isFeatured: true,
      category: parentId
        ? { OR: [{ id: categoryId }, { parentId }] }
        : { id: categoryId },
    },
  });

  if (featuredCount >= MAX_FEATURED_PER_CATEGORY) {
    return NextResponse.json({
      error: `Sin slots disponibles (${featuredCount}/${MAX_FEATURED_PER_CATEGORY} ocupados)`,
    }, { status: 409 });
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));

  const [promotion] = await Promise.all([
    prisma.promotion.create({
      data: {
        listingId,
        endDate,
        amount: parseFloat(amount),
        note: note || null,
      },
    }),
    prisma.listing.update({
      where: { id: listingId },
      data: { isFeatured: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    promotion,
    code: listing.code,
    slotsRemaining: MAX_FEATURED_PER_CATEGORY - featuredCount - 1,
  }, { status: 201 });
}

// DELETE — Remove promotion
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const listingId = request.nextUrl.searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ error: "Falta listingId" }, { status: 400 });
  }

  await prisma.promotion.updateMany({
    where: { listingId, isActive: true },
    data: { isActive: false },
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: { isFeatured: false },
  });

  return NextResponse.json({ success: true });
}
