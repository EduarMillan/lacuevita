import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// GET — List all offers (admin)
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { prisma } = await import("@/lib/db");
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;
  const q = searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { businessName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        promotions: { where: { isActive: true }, take: 1 },
      },
    }),
    prisma.offer.count({ where }),
  ]);

  return NextResponse.json({
    offers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// DELETE — Remove an offer (admin)
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { prisma } = await import("@/lib/db");

  const offer = await prisma.offer.findUnique({
    where: { id },
    select: { id: true, code: true, title: true },
  });

  if (!offer) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.offer.delete({ where: { id } });

  return NextResponse.json({
    message: `Oferta ${offer.code} eliminada`,
    deleted: { id: offer.id, code: offer.code, title: offer.title },
  });
}
