import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { prisma } = await import("@/lib/db");

  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const comuna = searchParams.get("comuna");
  const search = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: Record<string, unknown> = { isActive: true };

  if (region) {
    where.region = region;
  }

  if (comuna) {
    where.comuna = comuna;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [professionals, total] = await Promise.all([
    prisma.professional.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true, isVerified: true } },
        category: { select: { name: true, slug: true, icon: true } },
      },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.professional.count({ where }),
  ]);

  return NextResponse.json({
    professionals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const body = await request.json();
    const {
      title,
      description,
      location,
      region,
      comuna,
      phone,
      whatsapp,
      yearsExperience,
    } = body;

    if (!title || !description || !location || !region || !comuna) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
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

    // Check if user already has a professional profile
    const existing = await prisma.professional.findFirst({
      where: { userId: dbUser.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes un perfil profesional registrado" },
        { status: 400 },
      );
    }

    // Find or create a generic "Servicios" category for professionals
    let category = await prisma.category.findUnique({
      where: { slug: "servicios-profesionales" },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Servicios Profesionales",
          slug: "servicios-profesionales",
          icon: "engineering",
        },
      });
    }

    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const professional = await prisma.professional.create({
      data: {
        title,
        slug,
        description,
        yearsExperience: parseInt(yearsExperience) || 0,
        location,
        region,
        comuna,
        phone: phone || null,
        whatsapp: whatsapp || null,
        userId: dbUser.id,
        categoryId: category.id,
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ professional }, { status: 201 });
  } catch (err) {
    console.error("Error creating professional:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    );
  }
}
