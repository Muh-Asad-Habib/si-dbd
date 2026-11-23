import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b4f8a" }}>
        <svg width="120" height="120" viewBox="0 0 40 40">
          <path d="M20 6c-1.4 3-10 12.6-10 19.2a10 10 0 0 0 20 0C30 18.6 21.4 9 20 6Z" fill="#fff" />
          <path d="M13.5 25.5h4l2-4 2.5 7 2-3h2.5" fill="none" stroke="#c8102e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
