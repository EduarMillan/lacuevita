import { ImageResponse } from "next/og";
import { formatPrice, isCurrency } from "@/lib/format";

export const alt = "Anuncio en Tu Cuevita";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ListingOG({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { prisma } = await import("@/lib/db");

  const listing = await prisma.listing.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    select: {
      title: true,
      price: true,
      currency: true,
      location: true,
      code: true,
      condition: true,
      images: {
        where: { isPrimary: true },
        select: { url: true },
        take: 1,
      },
      category: { select: { name: true } },
    },
  });

  // Fallback when not found
  if (!listing) {
    return fallbackImage();
  }

  const photo = listing.images[0]?.url;
  const priceText = formatPrice(
    Number(listing.price),
    isCurrency(listing.currency) ? listing.currency : "CUP",
  );

  const conditionLabel: Record<string, string> = {
    NEW: "Nuevo",
    LIKE_NEW: "Como nuevo",
    USED: "Usado",
    FOR_PARTS: "Para repuestos",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #004D47 0%, #006A63 55%, #00897B 100%)",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.12)",
            display: "flex",
          }}
        />

        {/* Left: photo */}
        <div
          style={{
            width: 540,
            height: "100%",
            padding: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 32,
              overflow: "hidden",
              background: "rgba(255,255,255,0.1)",
              border: "4px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                width={540}
                height={540}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  fontSize: 200,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                }}
              >
                C
              </div>
            )}
          </div>
        </div>

        {/* Right: info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 60px 60px 0",
          }}
        >
          {/* Brand badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              width: "fit-content",
            }}
          >
            <span>🛍️</span>
            <span>Tu Cuevita</span>
          </div>

          {/* Title + meta */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "white",
                display: "flex",
                maxHeight: 200,
                overflow: "hidden",
              }}
            >
              {truncate(listing.title, 75)}
            </div>

            {listing.category?.name && (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  display: "flex",
                }}
              >
                {listing.category.name}
              </div>
            )}
          </div>

          {/* Price + condition */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 900,
                color: "#FBBF24",
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              {priceText}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 24,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <div
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                }}
              >
                {conditionLabel[listing.condition] || listing.condition}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>📍</span>
                <span>{truncate(listing.location, 30)}</span>
              </div>
            </div>
          </div>

          {/* Footer: code + domain */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 22,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(239,68,68,0.9)",
                color: "white",
              }}
            >
              <span>🏷</span>
              <span style={{ fontFamily: "monospace" }}>{listing.code}</span>
            </div>
            <div
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                background: "white",
                color: "#006A63",
                fontWeight: 800,
                display: "flex",
              }}
            >
              tucuevita.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #004D47 0%, #00897B 100%)",
          color: "white",
          fontWeight: 900,
          fontSize: 120,
          fontFamily: "sans-serif",
        }}
      >
        Tu Cuevita
      </div>
    ),
    { ...size },
  );
}
