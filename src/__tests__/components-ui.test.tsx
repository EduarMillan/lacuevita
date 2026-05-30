import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/link to render a simple anchor
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

import ProductCard from "@/components/ui/ProductCard";
import { CategoryCardStyles } from "@/components/ui/CategoryCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

describe("ProductCard", () => {
  const baseProps = {
    id: "test-slug",
    title: "iPhone 14 Pro",
    price: "$500.000",
    location: "Habana",
    time: "Hace 2h",
  };

  it("renders title and price", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("iPhone 14 Pro")).toBeInTheDocument();
    expect(screen.getByText("$500.000")).toBeInTheDocument();
  });

  it("renders location and time", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("Habana")).toBeInTheDocument();
    expect(screen.getByText("Hace 2h")).toBeInTheDocument();
  });

  it("links to /anuncio/{id}", () => {
    render(<ProductCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/anuncio/test-slug");
  });

  it("renders image when provided", () => {
    render(<ProductCard {...baseProps} image="https://example.com/img.jpg" />);
    const img = screen.getByAltText("iPhone 14 Pro");
    expect(img.getAttribute("src")).toContain("example.com");
  });

  it("renders placeholder when no image", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("image")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <ProductCard {...baseProps} description="Excelente estado, poco uso" />,
    );
    expect(
      screen.getByText("Excelente estado, poco uso"),
    ).toBeInTheDocument();
  });

  it("renders compact variant", () => {
    render(<ProductCard {...baseProps} compact />);
    expect(screen.getByText("iPhone 14 Pro")).toBeInTheDocument();
    expect(screen.getByText("$500.000")).toBeInTheDocument();
  });

  it("renders badges when provided", () => {
    render(
      <ProductCard
        {...baseProps}
        badges={[{ label: "Verificado", variant: "verified" }]}
      />,
    );
    expect(screen.getByText("Verificado")).toBeInTheDocument();
  });
});

describe("CategoryCardStyles", () => {
  it("renders a style tag with keyframes", () => {
    const { container } = render(<CategoryCardStyles />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.innerHTML).toContain("borderTrace");
    expect(style!.innerHTML).toContain("cat-card");
  });
});

describe("Breadcrumbs", () => {
  it("renders breadcrumb items", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categorias" },
          { label: "Compra y Venta" },
        ]}
      />,
    );
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Categorías")).toBeInTheDocument();
    expect(screen.getByText("Compra y Venta")).toBeInTheDocument();
  });

  it("links to href for items with href", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Current" },
        ]}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/")).toBe(true);
  });

  it("last item is not a link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Current Page" },
        ]}
      />,
    );
    // The last item should just be text, not wrapped in a link
    expect(screen.getByText("Current Page")).toBeInTheDocument();
    const currentEl = screen.getByText("Current Page");
    expect(currentEl.closest("a")).toBeNull();
  });
});
