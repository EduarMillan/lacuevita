import { describe, it, expect } from "vitest";

describe("listings API - filter building logic", () => {
  function buildWhere(params: Record<string, string | null>) {
    const where: Record<string, unknown> = { status: "ACTIVE" };

    const categorySlug = params.category;
    const search = params.q;
    const condition = params.condition;
    const location = params.location;
    const minPrice = params.minPrice;
    const maxPrice = params.maxPrice;

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
      where.price = {} as Record<string, number>;
      if (minPrice)
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice)
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    return where;
  }

  it("default where has only status ACTIVE", () => {
    const where = buildWhere({
      category: null,
      q: null,
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where).toEqual({ status: "ACTIVE" });
  });

  it("adds category filter with parent check", () => {
    const where = buildWhere({
      category: "vehiculos",
      q: null,
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where.category).toEqual({
      OR: [{ slug: "vehiculos" }, { parent: { slug: "vehiculos" } }],
    });
  });

  it("adds search filter for single word", () => {
    const where = buildWhere({
      category: null,
      q: "iphone",
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where.OR).toEqual([
      { title: { contains: "iphone", mode: "insensitive" } },
      { description: { contains: "iphone", mode: "insensitive" } },
    ]);
  });

  it("adds AND filter for multi-word search", () => {
    const where = buildWhere({
      category: null,
      q: "mesa madera",
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where.AND).toEqual([
      {
        OR: [
          { title: { contains: "mesa", mode: "insensitive" } },
          { description: { contains: "mesa", mode: "insensitive" } },
        ],
      },
      {
        OR: [
          { title: { contains: "madera", mode: "insensitive" } },
          { description: { contains: "madera", mode: "insensitive" } },
        ],
      },
    ]);
    expect(where.OR).toBeUndefined();
  });

  it("handles search with extra whitespace", () => {
    const where = buildWhere({
      category: null,
      q: "  iphone  pro  ",
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where.AND).toHaveLength(2);
  });

  it("handles empty search string", () => {
    const where = buildWhere({
      category: null,
      q: "   ",
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where.OR).toBeUndefined();
    expect(where.AND).toBeUndefined();
  });

  it("adds condition filter", () => {
    const where = buildWhere({
      category: null,
      q: null,
      condition: "USED",
      location: null,
      minPrice: null,
      maxPrice: null,
    });
    expect(where.condition).toBe("USED");
  });

  it("adds location filter", () => {
    const where = buildWhere({
      category: null,
      q: null,
      condition: null,
      location: "Habana",
      minPrice: null,
      maxPrice: null,
    });
    expect(where.location).toEqual({
      contains: "Habana",
      mode: "insensitive",
    });
  });

  it("adds price range filter (both min and max)", () => {
    const where = buildWhere({
      category: null,
      q: null,
      condition: null,
      location: null,
      minPrice: "5000",
      maxPrice: "50000",
    });
    expect(where.price).toEqual({ gte: 5000, lte: 50000 });
  });

  it("adds price filter with only min", () => {
    const where = buildWhere({
      category: null,
      q: null,
      condition: null,
      location: null,
      minPrice: "1000",
      maxPrice: null,
    });
    expect(where.price).toEqual({ gte: 1000 });
  });

  it("adds price filter with only max", () => {
    const where = buildWhere({
      category: null,
      q: null,
      condition: null,
      location: null,
      minPrice: null,
      maxPrice: "100000",
    });
    expect(where.price).toEqual({ lte: 100000 });
  });

  it("combines multiple filters with single-word search", () => {
    const where = buildWhere({
      category: "compra-venta",
      q: "mesa",
      condition: "USED",
      location: "Matanzas",
      minPrice: "10000",
      maxPrice: "80000",
    });
    expect(where.status).toBe("ACTIVE");
    expect(where.category).toBeDefined();
    expect(where.OR).toBeDefined();
    expect(where.condition).toBe("USED");
    expect(where.location).toBeDefined();
    expect(where.price).toEqual({ gte: 10000, lte: 80000 });
  });

  it("combines multiple filters with multi-word search", () => {
    const where = buildWhere({
      category: "compra-venta",
      q: "mesa madera",
      condition: "USED",
      location: "Matanzas",
      minPrice: "10000",
      maxPrice: "80000",
    });
    expect(where.status).toBe("ACTIVE");
    expect(where.category).toBeDefined();
    expect(where.AND).toHaveLength(2);
    expect(where.OR).toBeUndefined();
    expect(where.condition).toBe("USED");
    expect(where.location).toBeDefined();
    expect(where.price).toEqual({ gte: 10000, lte: 80000 });
  });
});

describe("listings API - sort logic", () => {
  function buildOrderBy(sort: string | null) {
    const orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      case "most_viewed":
        orderBy.viewCount = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }
    return orderBy;
  }

  it("defaults to createdAt desc", () => {
    expect(buildOrderBy(null)).toEqual({ createdAt: "desc" });
  });

  it("sorts by price ascending", () => {
    expect(buildOrderBy("price_asc")).toEqual({ price: "asc" });
  });

  it("sorts by price descending", () => {
    expect(buildOrderBy("price_desc")).toEqual({ price: "desc" });
  });

  it("sorts by most viewed", () => {
    expect(buildOrderBy("most_viewed")).toEqual({ viewCount: "desc" });
  });

  it("falls back to default for unknown sort", () => {
    expect(buildOrderBy("unknown")).toEqual({ createdAt: "desc" });
  });
});

describe("listings API - POST validation logic", () => {
  function validate(body: Record<string, unknown>) {
    const { title, description, price, categoryId, condition, location, imageUrls } = body;

    if (!title || !description || !price || !categoryId || !condition || !location) {
      return { error: "Faltan campos obligatorios", status: 400 };
    }

    if (!imageUrls || (imageUrls as string[]).length === 0) {
      return { error: "Debes subir al menos una imagen", status: 400 };
    }

    if ((imageUrls as string[]).length > 10) {
      return { error: "Máximo 10 imágenes por anuncio", status: 400 };
    }

    return null;
  }

  it("rejects missing title", () => {
    const result = validate({
      description: "desc",
      price: "100",
      categoryId: "cat",
      condition: "NEW",
      location: "loc",
      imageUrls: ["url"],
    });
    expect(result?.status).toBe(400);
    expect(result?.error).toContain("obligatorios");
  });

  it("rejects empty imageUrls", () => {
    const result = validate({
      title: "t",
      description: "d",
      price: "100",
      categoryId: "c",
      condition: "NEW",
      location: "l",
      imageUrls: [],
    });
    expect(result?.error).toContain("imagen");
  });

  it("rejects more than 10 images", () => {
    const result = validate({
      title: "t",
      description: "d",
      price: "100",
      categoryId: "c",
      condition: "NEW",
      location: "l",
      imageUrls: Array.from({ length: 11 }, (_, i) => `url-${i}`),
    });
    expect(result?.error).toContain("10");
  });

  it("passes with valid data", () => {
    const result = validate({
      title: "iPhone",
      description: "Buen estado",
      price: "500000",
      categoryId: "celulares",
      condition: "LIKE_NEW",
      location: "Habana",
      imageUrls: ["url1", "url2"],
    });
    expect(result).toBeNull();
  });
});
