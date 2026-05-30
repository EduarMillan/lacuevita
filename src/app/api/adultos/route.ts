import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — List active adult listings (public, requires age gate on client)
export async function GET(request: NextRequest) {
  const { prisma } = await import("@/lib/db");
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("q");
  const region = searchParams.get("region");
  const serviceType = searchParams.get("serviceType");

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (search) {
    const words = search.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      where.OR = [
        { title: { contains: words[0], mode: "insensitive" } },
        { description: { contains: words[0], mode: "insensitive" } },
        { alias: { contains: words[0], mode: "insensitive" } },
      ];
    } else if (words.length > 1) {
      where.AND = words.map((word) => ({
        OR: [
          { title: { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } },
        ],
      }));
    }
  }

  if (region) {
    where.region = region;
  }

  if (serviceType) {
    where.serviceType = serviceType;
  }

  const [listings, total] = await Promise.all([
    prisma.adultListing.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: {
          where: { isPresentation: true },
          take: 1,
        },
      },
    }),
    prisma.adultListing.count({ where }),
  ]);

  // Strip user info — only return alias and public data
  const sanitized = listings.map((l) => ({
    id: l.id,
    code: l.code,
    alias: l.alias,
    slug: l.slug,
    title: l.title,
    description: l.description,
    serviceType: l.serviceType,
    location: l.location,
    region: l.region,
    isFeatured: l.isFeatured,
    viewCount: l.viewCount,
    createdAt: l.createdAt,
    presentationImage: l.images[0]?.url || null,
  }));

  return NextResponse.json({
    listings: sanitized,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST — Create adult listing (requires auth)
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
    const { alias: rawAlias, title: rawTitle, description: rawDesc, serviceType, location, region, comuna, whatsapp: rawWhatsapp, imageUrls, presentationIndex, blurredIndexes } = body;

    const alias = typeof rawAlias === "string" ? rawAlias.trim() : "";
    const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
    const description = typeof rawDesc === "string" ? rawDesc.trim() : "";
    const whatsapp = typeof rawWhatsapp === "string" ? rawWhatsapp.trim() : "";

    if (!alias || !title || !description || !serviceType || !location || !whatsapp) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (alias.length < 2 || alias.length > 50) {
      return NextResponse.json({ error: "Alias: 2-50 caracteres" }, { status: 400 });
    }
    if (title.length < 5 || title.length > 120) {
      return NextResponse.json({ error: "Título: 5-120 caracteres" }, { status: 400 });
    }
    if (description.length < 20 || description.length > 2000) {
      return NextResponse.json({ error: "Descripción: 20-2000 caracteres" }, { status: 400 });
    }

    const VALID_SERVICE_TYPES = ["Masajes", "Compañía", "Entretenimiento", "Shows", "Fotografía", "Otro"];
    if (!VALID_SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json({ error: "Tipo de servicio inválido" }, { status: 400 });
    }

    if (!/^\+?\d{7,15}$/.test(whatsapp.replace(/[\s\-()]/g, ""))) {
      return NextResponse.json({ error: "Número de WhatsApp inválido" }, { status: 400 });
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "Debes subir al menos una imagen" }, { status: 400 });
    }

    if (imageUrls.length > 8) {
      return NextResponse.json({ error: "Máximo 8 imágenes" }, { status: 400 });
    }

    if (!imageUrls.every((url: unknown) => typeof url === "string" && url.startsWith("http"))) {
      return NextResponse.json({ error: "URLs de imágenes inválidas" }, { status: 400 });
    }

    // Ensure user exists in DB
    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {},
      create: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split("@")[0],
      },
    });

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Generate unique listing code (ADL-XXXXXX)
    const codeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let listingCode = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      let c = "ADL-";
      for (let i = 0; i < 6; i++) {
        c += codeChars[Math.floor(Math.random() * codeChars.length)];
      }
      const exists = await prisma.adultListing.findUnique({ where: { code: c } });
      if (!exists) {
        listingCode = c;
        break;
      }
    }

    if (!listingCode) {
      return NextResponse.json({ error: "No se pudo generar código único" }, { status: 500 });
    }

    const presIdx = typeof presentationIndex === "number" ? presentationIndex : 0;
    const hasBlurred = Array.isArray(blurredIndexes) && blurredIndexes.length > 0;

    // Generate single reveal code for the listing
    function generateRevealCode(): string {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      return code;
    }

    const listing = await prisma.adultListing.create({
      data: {
        code: listingCode,
        alias,
        slug,
        title,
        description,
        serviceType,
        location,
        whatsapp,
        isPhoneVisible: true,
        revealCode: hasBlurred ? generateRevealCode() : null,
        codeExpiresAt: hasBlurred ? new Date(Date.now() + 60 * 60 * 1000) : null,
        region: region || null,
        comuna: comuna || null,
        userId: dbUser.id,
        images: {
          create: imageUrls.map((url: string, index: number) => {
            const isBlurred = Array.isArray(blurredIndexes) && blurredIndexes.includes(index);
            return {
              url,
              order: index,
              isPresentation: index === presIdx,
              isBlurred,
              revealCode: generateRevealCode(),
            };
          }),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error("Error creating adult listing:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
