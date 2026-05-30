import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAuthUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getDbUser(email: string) {
  const { prisma } = await import("@/lib/db");
  return prisma.user.findUnique({ where: { email } });
}

// GET /api/listings/[id] — fetch single listing with all images (for edit page)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await getDbUser(user.email!);
    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id } = await params;
    const { prisma } = await import("@/lib/db");

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        category: {
          select: {
            name: true,
            slug: true,
            parent: { select: { slug: true } },
          },
        },
        user: { select: { phone: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
    }
    if (listing.userId !== dbUser.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("Error fetching listing:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    );
  }
}

// PUT /api/listings/[id] — update listing fields + images
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await getDbUser(user.email!);
    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id } = await params;
    const { prisma } = await import("@/lib/db");

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
    }
    if (listing.userId !== dbUser.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      condition,
      location,
      status,
      categoryId: categorySlug,
      keepImageIds,
      newImageUrls,
      imageOrder,
    } = body;

    // Build update data for scalar fields
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (currency !== undefined && ["CUP", "USD", "MLC"].includes(currency)) {
      data.currency = currency;
    }
    if (condition !== undefined) data.condition = condition;
    if (location !== undefined) data.location = location;
    if (status !== undefined) data.status = status;

    // Resolve category slug to ID if provided
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        data.categoryId = category.id;
      }
    }

    // Handle image changes if provided
    if (keepImageIds && imageOrder) {
      // Delete images that are no longer kept
      const currentImages = await prisma.listingImage.findMany({
        where: { listingId: id },
      });
      const idsToDelete = currentImages
        .filter((img) => !keepImageIds.includes(img.id))
        .map((img) => img.id);

      if (idsToDelete.length > 0) {
        await prisma.listingImage.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      // Build ordered list: assign new order + isPrimary to existing, create new images
      let newUrlIndex = 0;
      for (let i = 0; i < imageOrder.length; i++) {
        const entry = imageOrder[i];
        if (entry.type === "existing" && entry.id) {
          await prisma.listingImage.update({
            where: { id: entry.id },
            data: { order: i, isPrimary: i === 0 },
          });
        } else if (entry.type === "new" && newImageUrls && newUrlIndex < newImageUrls.length) {
          await prisma.listingImage.create({
            data: {
              url: newImageUrls[newUrlIndex],
              order: i,
              isPrimary: i === 0,
              listingId: id,
            },
          });
          newUrlIndex++;
        }
      }
    }

    const updated = await prisma.listing.update({
      where: { id },
      data,
      include: {
        images: { orderBy: { order: "asc" } },
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({ listing: updated });
  } catch (err) {
    console.error("Error updating listing:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await getDbUser(user.email!);
    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id } = await params;
    const { prisma } = await import("@/lib/db");

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
    }
    if (listing.userId !== dbUser.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting listing:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    );
  }
}
