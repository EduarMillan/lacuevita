import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { prisma } = await import("@/lib/db");

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(categories);
}
