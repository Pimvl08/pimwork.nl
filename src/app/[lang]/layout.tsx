import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Fragment_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { htmlLang, isLocale, locales, type Locale } from "@/i18n/config";
import { parseTheme, THEME_COOKIE } from "@/lib/prefs";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
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
    title: "Pim | Vorm uit één lijn",
    description:
      "De digitale wereld van Pim: acht echte projecten, gebouwd met code en AI, als genummerde platen. Met een lab vol experimenten, een terminal en data van zijn eigen schijf.",
  },
  en: {
    title: "Pim | Form from a single line",
    description:
      "Pim's digital world: eight real projects, built with code and AI, as numbered plates. With a lab of experiments, a terminal and data from his own disk.",
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
    title: { default: t.title, template: "%s | Pim" },
    description: t.description,
    applicationName: "Pim",
    authors: [{ name: "Pim", url: "https://github.com/pimdaanbram-prog" }],
    alternates: {
      canonical: `/${locale}`,
      languages: { "nl-NL": "/nl", "en-GB": "/en", "x-default": "/nl" },
    },
    openGraph: {
      type: "website",
      siteName: "Pim",
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
    <html lang={htmlLang[lang]} data-theme={theme} className={`${bodoni.variable} ${fragment.variable}`}>
      <body>
        <LocaleProvider lang={lang}>
          <SiteChrome lang={lang} initialTheme={theme}>
            {children}
            {modal}
          </SiteChrome>
        </LocaleProvider>
      </body>
    </html>
  );
}
