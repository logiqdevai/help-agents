import { ImageResponse } from "next/og";
import { APP_NAME } from "@/config/constants/app";
import { LandingSeo } from "@/config/constants/landing";

export const alt = LandingSeo.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f5f5f5",
          backgroundImage:
            "radial-gradient(circle at 92% 8%, rgba(167,229,211,0.95), rgba(167,229,211,0) 38%), radial-gradient(circle at 78% 92%, rgba(244,197,168,0.85), rgba(244,197,168,0) 34%), radial-gradient(circle at 100% 55%, rgba(200,184,224,0.9), rgba(200,184,224,0) 32%)",
          color: "#0c0a09",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              backgroundImage: "radial-gradient(circle at 30% 30%, #a7e5d3, #c8b8e0 60%, #f4c5a8)",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 500 }}>{APP_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 92, lineHeight: 1.04, letterSpacing: -3, maxWidth: 860 }}>
            AI agents that work for your business
          </div>
          <div style={{ fontSize: 34, color: "#4e4e4e" }}>Voice. Email. Messaging. One connected AI platform.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
