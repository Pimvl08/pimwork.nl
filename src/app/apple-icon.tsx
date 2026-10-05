import { ImageResponse } from "next/og";

/** Home screen icon: the crease mark, chalk disc on graphite, as a 180 px PNG. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same drawing as app/icon.svg, without rounded corners: iOS masks the shape itself.
const MARK = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="180" height="180">',
  "<defs>",
  '<linearGradient id="flap" x1="0.15" y1="0.2" x2="0.85" y2="0.9">',
  '<stop offset="0" stop-color="#d6d6d6"/>',
  '<stop offset="0.55" stop-color="#a8a8a8"/>',
  '<stop offset="1" stop-color="#6a6a6a"/>',
  "</linearGradient>",
  "</defs>",
  '<rect width="64" height="64" fill="#121211"/>',
  '<circle cx="32" cy="32" r="23" fill="#ece6da"/>',
  '<path d="M16.1 47.9 C 24.1 41.5 35.2 27.2 39.9 10.2 A 23 23 0 0 1 16.1 47.9 Z" fill="url(#flap)"/>',
  '<path d="M16.1 47.9 C 24.1 41.5 35.2 27.2 39.9 10.2" fill="none" stroke="#121211" stroke-width="1.6" stroke-linecap="round"/>',
  "</svg>",
].join("");

export default function AppleIcon() {
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#121211" }}>
        <img src={src} width={180} height={180} alt="" />
      </div>
    ),
    { ...size },
  );
}
