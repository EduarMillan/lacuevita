import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FEATURED_PER_CATEGORY = 8;

function authorize(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

// GET — List all active promotions
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");

  const promotions = await prisma.promotion.findMany({
    where: { isActive: true },
    include: {
      listing: {
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          isFeatured: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { endDate: "asc" },
  });

  return NextResponse.json({ promotions });
}

// POST — Activate a promotion
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { listingId, days, amount, note } = body;

  if (!listingId || !days || !amount) {
    return NextResponse.json(
      { error: "Faltan campos: listingId, days, amount" },
      { status: 400 },
    );
  }

  if (days < 1 || days > 365) {
    return NextResponse.json(
      { error: "Los días deben estar entre 1 y 365" },
      { status: 400 },
    );
  }

  // Find listing with category
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      category: {
        select: { id: true, parentId: true },
      },
    },
  });

  if (!listing) {
    return NextResponse.json(
      { error: "Anuncio no encontrado" },
      { status: 404 },
    );
  }

  if (listing.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Solo se pueden destacar anuncios activos" },
      { status: 400 },
    );
  }

  if (listing.isFeatured) {
    return NextResponse.json(
      { error: "Este anuncio ya está destacado" },
      { status: 400 },
    );
  }

  // Check slot availability in category (count featured in same category + parent)
  const categoryId = listing.category.id;
  const parentId = listing.category.parentId;

  // Count featured listings in same category or sibling categories under same parent
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
    return NextResponse.json(
      {
        error: `No hay slots disponibles. Máximo ${MAX_FEATURED_PER_CATEGORY} destacados por categoría (${featuredCount}/${MAX_FEATURED_PER_CATEGORY} ocupados)`,
      },
      { status: 409 },
    );
  }

  // Create promotion and update listing
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

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

  return NextResponse.json(
    {
      promotion,
      listing: { code: listing.code, title: listing.title },
      slotsRemaining: MAX_FEATURED_PER_CATEGORY - featuredCount - 1,
    },
    { status: 201 },
  );
}

// DELETE — Deactivate a promotion
export async function DELETE(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const { searchParams } = request.nextUrl;
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json(
      { error: "Falta listingId" },
      { status: 400 },
    );
  }

  // Deactivate all active promotions for this listing
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
