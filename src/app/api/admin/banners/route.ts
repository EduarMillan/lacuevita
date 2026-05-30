import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BANNERS = 5;

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return user;
}

// GET — List all banners
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");

  const banners = await prisma.banner.findMany({
    orderBy: { position: "asc" },
  });

  return NextResponse.json({
    banners,
    maxBanners: MAX_BANNERS,
    activeBanners: banners.filter((b) => b.isActive).length,
  });
}

// POST — Create banner
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { businessName, imageUrl, linkUrl, days, amount, note } = body;

  if (!businessName || !imageUrl || !days || !amount) {
    return NextResponse.json(
      { error: "Faltan campos: businessName, imageUrl, days, amount" },
      { status: 400 },
    );
  }

  const activeCount = await prisma.banner.count({ where: { isActive: true } });
  if (activeCount >= MAX_BANNERS) {
    return NextResponse.json(
      { error: `Sin slots disponibles (${activeCount}/${MAX_BANNERS})` },
      { status: 409 },
    );
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));

  const banner = await prisma.banner.create({
    data: {
      businessName,
      imageUrl,
      linkUrl: linkUrl || null,
      endDate,
      amount: parseFloat(amount),
      note: note || null,
      position: activeCount,
    },
  });

  return NextResponse.json({ banner, slotsRemaining: MAX_BANNERS - activeCount - 1 }, { status: 201 });
}

// PUT — Update banner
export async function PUT(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const banner = await prisma.banner.update({
    where: { id },
    data,
  });

  return NextResponse.json({ banner });
}

// DELETE — Remove banner
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  await prisma.banner.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
