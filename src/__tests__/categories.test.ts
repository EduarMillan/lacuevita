import { describe, it, expect } from "vitest";
import {
  categories,
  getTopCategories,
  getCategoryBySlug,
  getSubcategories,
  type CategoryData,
} from "@/lib/categories";

describe("categories data", () => {
  it("exports a non-empty array of categories", () => {
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("every category has required fields", () => {
    for (const cat of categories) {
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });

  it("all top-level slugs are unique", () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all child slugs across all categories are unique", () => {
    const allChildSlugs: string[] = [];
    for (const cat of categories) {
      if (cat.children) {
        for (const child of cat.children) {
          allChildSlugs.push(child.slug);
        }
      }
    }
    expect(new Set(allChildSlugs).size).toBe(allChildSlugs.length);
  });

  it("child slugs don't collide with top-level slugs", () => {
    const topSlugs = new Set(categories.map((c) => c.slug));
    for (const cat of categories) {
      if (cat.children) {
        for (const child of cat.children) {
          expect(topSlugs.has(child.slug)).toBe(false);
        }
      }
    }
  });

  it("every child has required fields", () => {
    for (const cat of categories) {
      if (cat.children) {
        for (const child of cat.children) {
          expect(child.name).toBeTruthy();
          expect(child.slug).toBeTruthy();
          expect(child.icon).toBeTruthy();
        }
      }
    }
  });
});

describe("getTopCategories()", () => {
  it("returns all top-level categories without children", () => {
    const top = getTopCategories();
    expect(top.length).toBe(categories.length);
    for (const cat of top) {
      expect(cat).not.toHaveProperty("children");
      expect(cat.name).toBeTruthy();
      expect(cat.slug).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });
});

describe("getCategoryBySlug()", () => {
  it("finds a top-level category", () => {
    const result = getCategoryBySlug("compra-venta");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Compra y Venta");
    expect(result!.slug).toBe("compra-venta");
  });

  it("top-level result includes children", () => {
    const result = getCategoryBySlug("vehiculos") as CategoryData;
    expect(result.children).toBeDefined();
    expect(result.children!.length).toBeGreaterThan(0);
  });

  it("finds a child category and includes parent info", () => {
    const result = getCategoryBySlug("celulares-accesorios") as CategoryData & {
      parent?: { name: string; slug: string };
    };
    expect(result).not.toBeNull();
    expect(result.name).toBe("Celulares y Accesorios");
    expect(result.parent).toBeDefined();
    expect(result.parent!.slug).toBe("compra-venta");
  });

  it("returns null for non-existent slug", () => {
    expect(getCategoryBySlug("does-not-exist")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getCategoryBySlug("")).toBeNull();
  });
});

describe("getSubcategories()", () => {
  it("returns subcategories for a valid parent", () => {
    const subs = getSubcategories("compra-venta");
    expect(subs.length).toBeGreaterThan(0);
    expect(subs[0].name).toBeTruthy();
  });

  it("returns empty array for non-existent parent", () => {
    expect(getSubcategories("no-existe")).toEqual([]);
  });

  it("returns empty array for a child slug (not a parent)", () => {
    expect(getSubcategories("celulares-accesorios")).toEqual([]);
  });
});
