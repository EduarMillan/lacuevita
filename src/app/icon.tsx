import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #006A63 0%, #00897B 60%, #14B8A6 100%)",
          color: "white",
          fontWeight: 900,
          fontSize: 44,
          fontFamily: "sans-serif",
          letterSpacing: "-0.04em",
          borderRadius: 12,
        }}
      >
        C
      </div>
    ),
    { ...size },
  );
}
