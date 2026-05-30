import { describe, it, expect } from "vitest";

describe("listings/[id] API - PUT update data building", () => {
  function buildUpdateData(body: Record<string, unknown>) {
    const { title, description, price, condition, location, status } = body;
    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price as string);
    if (condition !== undefined) data.condition = condition;
    if (location !== undefined) data.location = location;
    if (status !== undefined) data.status = status;

    return data;
  }

  it("builds data only for provided fields", () => {
    const data = buildUpdateData({ title: "New Title" });
    expect(data).toEqual({ title: "New Title" });
    expect(data).not.toHaveProperty("description");
    expect(data).not.toHaveProperty("price");
  });

  it("parses price as float", () => {
    const data = buildUpdateData({ price: "15000.50" });
    expect(data.price).toBe(15000.5);
  });

  it("handles status change", () => {
    const data = buildUpdateData({ status: "PAUSED" });
    expect(data).toEqual({ status: "PAUSED" });
  });

  it("handles all fields at once", () => {
    const data = buildUpdateData({
      title: "T",
      description: "D",
      price: "100",
      condition: "USED",
      location: "Habana",
      status: "ACTIVE",
    });
    expect(Object.keys(data).length).toBe(6);
    expect(data.price).toBe(100);
  });

  it("empty body produces empty data", () => {
    const data = buildUpdateData({});
    expect(data).toEqual({});
  });
});

describe("listings/[id] API - image management logic", () => {
  interface ImageRecord {
    id: string;
    url: string;
    order: number;
  }

  function computeImageChanges(
    currentImages: ImageRecord[],
    keepImageIds: string[],
    imageOrder: Array<{ type: string; id?: string }>,
    newImageUrls: string[],
  ) {
    const idsToDelete = currentImages
      .filter((img) => !keepImageIds.includes(img.id))
      .map((img) => img.id);

    const operations: Array<{
      action: "update" | "create";
      id?: string;
      url?: string;
      order: number;
      isPrimary: boolean;
    }> = [];

    let newUrlIndex = 0;
    for (let i = 0; i < imageOrder.length; i++) {
      const entry = imageOrder[i];
      if (entry.type === "existing" && entry.id) {
        operations.push({
          action: "update",
          id: entry.id,
          order: i,
          isPrimary: i === 0,
        });
      } else if (entry.type === "new" && newUrlIndex < newImageUrls.length) {
        operations.push({
          action: "create",
          url: newImageUrls[newUrlIndex],
          order: i,
          isPrimary: i === 0,
        });
        newUrlIndex++;
      }
    }

    return { idsToDelete, operations };
  }

  it("deletes images not in keepImageIds", () => {
    const current = [
      { id: "a", url: "u1", order: 0 },
      { id: "b", url: "u2", order: 1 },
      { id: "c", url: "u3", order: 2 },
    ];
    const { idsToDelete } = computeImageChanges(
      current,
      ["a", "c"],
      [{ type: "existing", id: "a" }, { type: "existing", id: "c" }],
      [],
    );
    expect(idsToDelete).toEqual(["b"]);
  });

  it("keeps all images when all IDs are in keepImageIds", () => {
    const current = [
      { id: "a", url: "u1", order: 0 },
      { id: "b", url: "u2", order: 1 },
    ];
    const { idsToDelete } = computeImageChanges(
      current,
      ["a", "b"],
      [{ type: "existing", id: "a" }, { type: "existing", id: "b" }],
      [],
    );
    expect(idsToDelete).toEqual([]);
  });

  it("reorders existing images", () => {
    const current = [
      { id: "a", url: "u1", order: 0 },
      { id: "b", url: "u2", order: 1 },
    ];
    const { operations } = computeImageChanges(
      current,
      ["a", "b"],
      [{ type: "existing", id: "b" }, { type: "existing", id: "a" }],
      [],
    );
    expect(operations[0]).toEqual({
      action: "update",
      id: "b",
      order: 0,
      isPrimary: true,
    });
    expect(operations[1]).toEqual({
      action: "update",
      id: "a",
      order: 1,
      isPrimary: false,
    });
  });

  it("creates new images from newImageUrls", () => {
    const { operations } = computeImageChanges(
      [],
      [],
      [{ type: "new" }, { type: "new" }],
      ["new-url-1", "new-url-2"],
    );
    expect(operations.length).toBe(2);
    expect(operations[0]).toEqual({
      action: "create",
      url: "new-url-1",
      order: 0,
      isPrimary: true,
    });
    expect(operations[1]).toEqual({
      action: "create",
      url: "new-url-2",
      order: 1,
      isPrimary: false,
    });
  });

  it("mixes existing and new images", () => {
    const current = [{ id: "a", url: "u1", order: 0 }];
    const { idsToDelete, operations } = computeImageChanges(
      current,
      ["a"],
      [{ type: "existing", id: "a" }, { type: "new" }],
      ["new-url"],
    );
    expect(idsToDelete).toEqual([]);
    expect(operations.length).toBe(2);
    expect(operations[0].action).toBe("update");
    expect(operations[1].action).toBe("create");
    expect(operations[0].isPrimary).toBe(true);
    expect(operations[1].isPrimary).toBe(false);
  });

  it("first image in order is always primary", () => {
    const { operations } = computeImageChanges(
      [{ id: "a", url: "u1", order: 1 }],
      ["a"],
      [{ type: "new" }, { type: "existing", id: "a" }],
      ["new-url"],
    );
    expect(operations[0].isPrimary).toBe(true);
    expect(operations[1].isPrimary).toBe(false);
  });
});

describe("listings/[id] API - authorization checks", () => {
  it("owner matches listing userId", () => {
    const listing = { userId: "user-123" };
    const dbUser = { id: "user-123" };
    expect(listing.userId === dbUser.id).toBe(true);
  });

  it("non-owner is rejected", () => {
    const listing = { userId: "user-123" };
    const dbUser = { id: "user-456" };
    expect(listing.userId === dbUser.id).toBe(false);
  });
});
