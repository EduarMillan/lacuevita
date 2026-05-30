import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FEATURED_PER_CATEGORY = 8;

export async function GET(request: NextRequest) {
  const categorySlug = request.nextUrl.searchParams.get("category");

  if (!categorySlug) {
    return NextResponse.json(
      { error: "Parámetro 'category' requerido" },
      { status: 400 },
    );
  }

  const { prisma } = await import("@/lib/db");

  // Find category and check if it's a parent
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, parentId: true },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Categoría no encontrada" },
      { status: 404 },
    );
  }

  // Category filter for the whole tree (parent + children)
  const categoryFilter = category.parentId
    ? { OR: [{ id: category.id }, { parentId: category.parentId }] }
    : { OR: [{ id: category.id }, { parentId: category.id }] };

  // Count featured in this category tree
  const used = await prisma.listing.count({
    where: {
      status: "ACTIVE",
      isFeatured: true,
      category: categoryFilter,
    },
  });

  const available = Math.max(0, MAX_FEATURED_PER_CATEGORY - used);

  // If full, find the earliest ending active promotion in this category
  let nextSlotDate: string | null = null;
  if (available === 0) {
    const earliest = await prisma.promotion.findFirst({
      where: {
        isActive: true,
        listing: {
          status: "ACTIVE",
          isFeatured: true,
          category: categoryFilter,
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
    total: MAX_FEATURED_PER_CATEGORY,
    used,
    available,
    nextSlotDate,
  });
}
