import { describe, it, expect } from "vitest";
import {
  regions,
  getRegionById,
  getComunaById,
} from "@/lib/regions";

describe("regions data", () => {
  it("exports a non-empty array of regions", () => {
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBe(16); // 15 provincias + Isla de la Juventud
  });

  it("every region has required fields", () => {
    for (const r of regions) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.shortName).toBeTruthy();
      expect(r.romanNumeral).toBeTruthy();
      expect(Array.isArray(r.comunas)).toBe(true);
      expect(r.comunas.length).toBeGreaterThan(0);
    }
  });

  it("all region IDs are unique", () => {
    const ids = regions.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all comuna IDs within a region are unique", () => {
    for (const region of regions) {
      const ids = region.comunas.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every comuna has id and name", () => {
    for (const region of regions) {
      for (const comuna of region.comunas) {
        expect(comuna.id).toBeTruthy();
        expect(comuna.name).toBeTruthy();
      }
    }
  });

  it("includes known Cuban provinces", () => {
    const ids = regions.map((r) => r.id);
    expect(ids).toContain("la-habana");
    expect(ids).toContain("santiago-de-cuba");
    expect(ids).toContain("matanzas");
    expect(ids).toContain("villa-clara");
    expect(ids).toContain("isla-de-la-juventud");
  });

  it("La Habana includes Habana Vieja and known municipios", () => {
    const hab = regions.find((r) => r.id === "la-habana")!;
    const comunaIds = hab.comunas.map((c) => c.id);
    expect(comunaIds).toContain("habana-vieja");
    expect(comunaIds).toContain("centro-habana");
    expect(comunaIds).toContain("plaza-de-la-revolucion");
    expect(comunaIds).toContain("playa");
  });
});

describe("getRegionById()", () => {
  it("finds La Habana", () => {
    const r = getRegionById("la-habana");
    expect(r).toBeDefined();
    expect(r!.shortName).toBe("Habana");
    expect(r!.romanNumeral).toBe("HAB");
  });

  it("finds Matanzas", () => {
    const r = getRegionById("matanzas");
    expect(r).toBeDefined();
    expect(r!.name).toBe("Matanzas");
  });

  it("returns undefined for non-existent region", () => {
    expect(getRegionById("inexistente")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getRegionById("")).toBeUndefined();
  });
});

describe("getComunaById()", () => {
  it("finds Habana Vieja in La Habana", () => {
    const c = getComunaById("la-habana", "habana-vieja");
    expect(c).toBeDefined();
    expect(c!.name).toBe("Habana Vieja");
  });

  it("finds Varadero region municipality (Cárdenas in Matanzas)", () => {
    const c = getComunaById("matanzas", "cardenas");
    expect(c).toBeDefined();
    expect(c!.name).toBe("Cárdenas");
  });

  it("returns undefined for wrong region", () => {
    expect(getComunaById("la-habana", "cardenas")).toBeUndefined();
  });

  it("returns undefined for non-existent comuna", () => {
    expect(getComunaById("la-habana", "inexistente")).toBeUndefined();
  });

  it("returns undefined for non-existent region", () => {
    expect(getComunaById("inexistente", "habana-vieja")).toBeUndefined();
  });
});
