import { ImageResponse } from "next/og";

export const alt =
  "La Cuevita — Marketplace comunitario en Cuba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #004D47 0%, #006A63 45%, #00897B 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.12)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "10px 24px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            width: "fit-content",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span>🛍️</span>
          <span>Marketplace comunitario</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#A7F3D0",
            }}
          >
            La
          </div>
          <div
            style={{
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            Cuevita
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              maxWidth: 900,
              marginTop: 12,
            }}
          >
            Compra, vende e intercambia con vecinos de confianza.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FBBF24",
                display: "flex",
              }}
            />
            <span>Vendedores verificados en Cuba</span>
          </div>
          <div
            style={{
              padding: "12px 28px",
              borderRadius: "999px",
              background: "#FFFFFF",
              color: "#006A63",
              fontWeight: 800,
              display: "flex",
            }}
          >
            tucuevita.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
