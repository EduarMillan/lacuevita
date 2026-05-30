import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// GET — List all adult listings (admin)
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { prisma } = await import("@/lib/db");
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { alias: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.adultListing.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isPresentation: true }, take: 1 },
        user: { select: { email: true } },
        promotions: { where: { isActive: true }, take: 1 },
      },
    }),
    prisma.adultListing.count({ where }),
  ]);

  return NextResponse.json({
    listings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// DELETE — Remove an adult listing (admin)
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { prisma } = await import("@/lib/db");

  const listing = await prisma.adultListing.findUnique({
    where: { id },
    select: { id: true, code: true, alias: true },
  });

  if (!listing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.adultListing.delete({ where: { id } });

  return NextResponse.json({
    message: `Anuncio ${listing.code} eliminado`,
    deleted: { id: listing.id, code: listing.code, alias: listing.alias },
  });
}
