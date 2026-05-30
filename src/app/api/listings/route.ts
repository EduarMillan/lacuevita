import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { prisma } = await import("@/lib/db");

  // Eliminar anuncios pausados hace más de 7 días
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await prisma.listing.deleteMany({
    where: { status: "PAUSED", updatedAt: { lte: oneWeekAgo } },
  });

  const searchParams = request.nextUrl.searchParams;
  const categorySlug = searchParams.get("category");
  const search = searchParams.get("q");
  const condition = searchParams.get("condition");
  const location = searchParams.get("location");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (categorySlug) {
    where.category = {
      OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }],
    };
  }

  if (search) {
    const words = search.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      where.OR = [
        { title: { contains: words[0], mode: "insensitive" } },
        { description: { contains: words[0], mode: "insensitive" } },
      ];
    } else if (words.length > 1) {
      // Each word must appear in title OR description
      where.AND = words.map((word) => ({
        OR: [
          { title: { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } },
        ],
      }));
    }
  }

  if (condition) {
    where.condition = condition;
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
  }

  const sortField: Record<string, string> = {};
  switch (sort) {
    case "price_asc":
      sortField.price = "asc";
      break;
    case "price_desc":
      sortField.price = "desc";
      break;
    case "most_viewed":
      sortField.viewCount = "desc";
      break;
    default:
      sortField.createdAt = "desc";
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        user: { select: { name: true, isVerified: true } },
      },
      orderBy: [{ isFeatured: "desc" }, sortField],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
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
    const { title, description, price, currency, categoryId, condition, location, phone, imageUrls } = body;
    const allowedCurrencies = ["CUP", "USD", "MLC"];
    const finalCurrency = allowedCurrencies.includes(currency) ? currency : "CUP";

    // Validation
    if (!title || !description || !price || !categoryId || !condition || !location) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Debes subir al menos una imagen" },
        { status: 400 }
      );
    }

    if (imageUrls.length > 10) {
      return NextResponse.json(
        { error: "Máximo 10 imágenes por anuncio" },
        { status: 400 }
      );
    }

    // categoryId from the form is actually a slug — resolve to real DB id
    const category = await prisma.category.findUnique({
      where: { slug: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 400 }
      );
    }

    // Ensure user exists in our DB (upsert from Supabase auth)
    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url,
        phone: phone || undefined,
      },
      create: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url,
        phone: phone || undefined,
      },
    });

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Generate unique listing code (LC-XXXXXX)
    const codeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let listingCode = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      let c = "LC-";
      for (let i = 0; i < 6; i++) {
        c += codeChars[Math.floor(Math.random() * codeChars.length)];
      }
      const exists = await prisma.listing.findUnique({ where: { code: c } });
      if (!exists) {
        listingCode = c;
        break;
      }
    }
    if (!listingCode) {
      return NextResponse.json(
        { error: "No se pudo generar código único" },
        { status: 500 },
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        slug,
        code: listingCode,
        description,
        price: parseFloat(price),
        currency: finalCurrency,
        condition,
        location,
        userId: dbUser.id,
        categoryId: category.id,
        images: {
          create: imageUrls.map((url: string, index: number) => ({
            url,
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        images: true,
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error("Error creating listing:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
