import { ImageResponse } from "next/og";
export const alt =
  "LeoTheTechGuy — Software that makes your business work better";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#101f20",
        color: "white",
        width: "100%",
        height: "100%",
        padding: "70px",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
        LeoTheTechGuy<span style={{ color: "#6ee7b7" }}>.</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 74,
          lineHeight: 1.08,
          letterSpacing: "-3px",
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex" }}>Software that makes</div>
        <div style={{ display: "flex", color: "#6ee7b7" }}>
          your business work better.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          color: "#cbd5e1",
        }}
      >
        <span>Custom software · Mobile products · Automation</span>
        <span>Warsaw · Worldwide</span>
      </div>
    </div>,
    size,
  );
}
