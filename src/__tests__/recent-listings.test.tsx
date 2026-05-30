import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ fill, ...props }: Record<string, unknown>) => <img data-fill={fill ? "true" : undefined} {...props} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/contexts/FavoritesContext", () => ({
  useFavorites: () => ({
    favoriteIds: new Set<string>(),
    toggleFavorite: vi.fn(),
    isLoaded: false,
  }),
}));

import RecentListings from "@/components/home/RecentListings";

function makeListing(id: string, title: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    slug: `${title.toLowerCase().replace(/\s/g, "-")}-${id}`,
    title,
    price: "100000",
    location: "Habana",
    viewCount: 5,
    isFeatured: false,
    description: "Test description",
    createdAt: new Date().toISOString(),
    images: [{ url: "https://example.com/img.jpg" }],
    ...overrides,
  };
}

describe("RecentListings", () => {
  it("renders initial listings", () => {
    const listings = [
      makeListing("1", "iPhone 14"),
      makeListing("2", "Samsung Galaxy"),
    ];
    render(<RecentListings initialListings={listings} totalCount={2} />);
    expect(screen.getByText("iPhone 14")).toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy")).toBeInTheDocument();
  });

  it("does not show 'Ver más' when all listings loaded", () => {
    const listings = [makeListing("1", "Item 1")];
    render(<RecentListings initialListings={listings} totalCount={1} />);
    expect(screen.queryByText("Ver más anuncios")).not.toBeInTheDocument();
  });

  it("shows 'Ver más' when more listings available", () => {
    const listings = [makeListing("1", "Item 1")];
    render(<RecentListings initialListings={listings} totalCount={50} />);
    expect(screen.getByText("Ver más anuncios")).toBeInTheDocument();
  });

  it("loads more listings on button click", async () => {
    const user = userEvent.setup();
    const initialListings = [makeListing("1", "Item 1")];
    const moreListings = [makeListing("2", "Item 2"), makeListing("3", "Item 3")];

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ listings: moreListings }),
    });

    render(<RecentListings initialListings={initialListings} totalCount={50} />);
    await user.click(screen.getByText("Ver más anuncios"));

    expect(global.fetch).toHaveBeenCalledWith("/api/listings?page=2&limit=40");
    expect(await screen.findByText("Item 2")).toBeInTheDocument();
    expect(await screen.findByText("Item 3")).toBeInTheDocument();
    // Original item still present
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("renders featured badges", () => {
    const listings = [makeListing("1", "Featured Item", { isFeatured: true })];
    render(<RecentListings initialListings={listings} totalCount={1} />);
    expect(screen.getByText("Destacado")).toBeInTheDocument();
  });
});
