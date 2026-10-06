import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Fragment_Mono, Hanken_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { htmlLang, isLocale, locales, type Locale } from "@/i18n/config";
import { parseTheme, THEME_COOKIE } from "@/lib/prefs";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hanken",
  display: "swap",
});

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment",
  display: "swap",
  preload: false,
});

const meta = {
  nl: {
    title: "PimWork | Software die werk uit handen neemt",
    description:
      "Ik bouw web-apps, desktopsoftware en slimme tools die werk uit handen nemen. Bekijk mijn werk en neem contact op.",
  },
  en: {
    title: "PimWork | Software that takes work off your hands",
    description:
      "I build web apps, desktop software and smart tools that take work off your hands. See my work and get in touch.",
  },
} satisfies Record<Locale, { title: string; description: string }>;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "nl";
  const t = meta[locale];
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.title, template: "%s | PimWork" },
    description: t.description,
    applicationName: "PimWork",
    authors: [{ name: "Pim", url: "https://github.com/pimdaanbram-prog" }],
    alternates: {
      canonical: `/${locale}`,
      languages: { "nl-NL": "/nl", "en-GB": "/en", "x-default": "/nl" },
    },
    openGraph: {
      type: "website",
      siteName: "PimWork",
      title: t.title,
      description: t.description,
      locale: htmlLang[locale].replace("-", "_"),
      alternateLocale: locale === "nl" ? ["en_GB"] : ["nl_NL"],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
    { media: "(prefers-color-scheme: light)", color: "#f2efe6" },
  ],
};

export default async function RootLayout({ children, params, modal }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html lang={htmlLang[lang]} data-theme={theme} className={`${bodoni.variable} ${hanken.variable} ${fragment.variable}`}>
      <body>
        <LocaleProvider lang={lang}>
          <SiteChrome lang={lang} initialTheme={theme}>
            {children}
            {modal}
          </SiteChrome>
        </LocaleProvider>
        {/* Only on Vercel: elsewhere the /_vercel scripts do not exist and would 404. */}
        {process.env.VERCEL ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
