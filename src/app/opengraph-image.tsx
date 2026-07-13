import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Aliyah Navigator — free personalised aliyah plan by Olim Paveway";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1640 0%, #2a2260 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            marginBottom: 28,
          }}
        >
          A free tool by Olim Paveway
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
          Aliyah Navigator
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.75)",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          Answer 8 questions. Get your personalised aliyah plan as a PDF —
          free, in 60 seconds.
        </div>
      </div>
    ),
    { ...size }
  );
}
