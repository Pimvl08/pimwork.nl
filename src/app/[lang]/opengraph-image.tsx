import { ImageResponse } from "next/og";
import { isLocale, type Locale } from "@/i18n/config";

export const alt = "PimWork: software die werk uit handen neemt / software that takes work off your hands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The night theme's tokens, copied as literals because the image renderer
 * has no access to CSS variables. Keep in step with globals.css (dark).
 */
const PAPER = "#121211";
const SHADE_1 = "#2a2926";
const SHADE_2 = "#5c5953";
const INK = "#ece6da";
const INK_MUTE = "#9a958c";
const RULE = "#34322e";
const RULE_STRONG = "#4a4742";

const copy: Record<Locale, { tagline: string; line: string }> = {
  nl: { tagline: "Software die werk uit handen neemt", line: "Web-apps, desktopsoftware en slimme tools" },
  en: { tagline: "Software that takes work off your hands", line: "Web apps, desktop software and smart tools" },
};

/** Site Open Graph image: graphite ground, the disc with one crease, the name. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = copy[isLocale(lang) ? lang : "nl"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          color: INK,
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <radialGradient id="shade" cx="38%" cy="34%" r="75%">
              <stop offset="0%" stopColor={SHADE_2} />
              <stop offset="55%" stopColor={SHADE_1} />
              <stop offset="100%" stopColor={PAPER} />
            </radialGradient>
          </defs>
          <path d="M-40 560 Q600 250 1240 560" fill="none" stroke={RULE} strokeWidth="1.5" />
          <path d="M-40 600 Q600 330 1240 600" fill="none" stroke={RULE} strokeWidth="1" />
          <circle cx="880" cy="300" r="232" fill="url(#shade)" stroke={RULE_STRONG} strokeWidth="1.5" />
          <path d="M720 132 Q850 300 1040 468" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="880" cy="300" r="262" fill="none" stroke={RULE} strokeWidth="1" strokeDasharray="2 10" />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 0 92px 88px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 160, lineHeight: 1, letterSpacing: "-0.03em" }}>PimWork</div>
          <div style={{ display: "flex", marginTop: 26, maxWidth: 640, fontSize: 46, lineHeight: 1.15, color: INK }}>{t.tagline}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 28, color: INK_MUTE }}>{t.line}</div>
        </div>
      </div>
    ),
    size,
  );
}
