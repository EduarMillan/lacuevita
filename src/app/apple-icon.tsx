import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #006A63 0%, #00897B 55%, #14B8A6 100%)",
          color: "white",
          fontWeight: 900,
          fontSize: 130,
          fontFamily: "sans-serif",
          letterSpacing: "-0.04em",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            display: "flex",
          }}
        />
        <span style={{ position: "relative", display: "flex" }}>C</span>
      </div>
    ),
    { ...size },
  );
}
