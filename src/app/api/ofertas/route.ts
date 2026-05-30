import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { prisma } = await import("@/lib/db");

  // Purge expired offers
  await prisma.offer.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });

  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const comuna = searchParams.get("comuna");
  const search = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "18");

  const where: Record<string, unknown> = {};

  if (region) {
    where.region = region;
  }

  if (comuna) {
    where.comuna = comuna;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { businessName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        promotions: {
          where: { isActive: true },
          select: { endDate: true },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.offer.count({ where }),
  ]);

  return NextResponse.json({
    offers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const body = await request.json();
    const {
      title,
      businessName,
      description,
      address,
      region,
      comuna,
      phone,
      whatsapp,
      imageUrl,
      expiresAt,
    } = body;

    if (
      !title ||
      !businessName ||
      !description ||
      !address ||
      !region ||
      !comuna ||
      !phone ||
      !expiresAt
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const expDate = new Date(expiresAt);
    if (expDate <= new Date()) {
      return NextResponse.json(
        { error: "La fecha de expiración debe ser futura" },
        { status: 400 },
      );
    }

    // Upsert user
    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email!.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url,
        phone: phone || undefined,
      },
      create: {
        email: user.email!,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email!.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url,
        phone: phone || undefined,
      },
    });

    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Generate unique offer code OFR-XXXXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      let candidate = "OFR-";
      for (let i = 0; i < 6; i++) {
        candidate += chars[Math.floor(Math.random() * chars.length)];
      }
      const exists = await prisma.offer.findUnique({ where: { code: candidate } });
      if (!exists) { code = candidate; break; }
    }
    if (!code) {
      return NextResponse.json({ error: "Error generando código" }, { status: 500 });
    }

    const offer = await prisma.offer.create({
      data: {
        code,
        title,
        slug,
        businessName,
        description,
        address,
        region,
        comuna,
        phone,
        whatsapp: whatsapp || null,
        imageUrl: imageUrl || null,
        expiresAt: expDate,
        userId: dbUser.id,
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (err) {
    console.error("Error creating offer:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    );
  }
}
