/**
 * Builds the printable portfolio (one PDF per language) from the same content
 * the site uses. Output: public/portfolio-pim-nl.pdf, public/portfolio-pim-en.pdf.
 *
 *   npm run catalogue
 *
 * Fonts are local static instances of Bodoni Moda and Fragment Mono (SIL OFL),
 * because react-pdf cannot load remote or variable fonts.
 */
import path from "node:path";
import React from "react";
import { Document, Font, Link, Page, Path, Circle, StyleSheet, Svg, Text, View, renderToFile, Defs, LinearGradient, Stop } from "@react-pdf/renderer";
import { projects } from "../src/content/projects";
import { about, facts, services } from "../src/content/person";

type Lang = "nl" | "en";

const fonts = path.join(process.cwd(), "assets", "fonts");
Font.register({
  family: "Bodoni",
  fonts: [
    { src: path.join(fonts, "BodoniModa-Regular.ttf"), fontWeight: 400, fontStyle: "normal" },
    { src: path.join(fonts, "BodoniModa-SemiBold.ttf"), fontWeight: 600, fontStyle: "normal" },
    { src: path.join(fonts, "BodoniModa-Italic-Text.ttf"), fontWeight: 400, fontStyle: "italic" },
    { src: path.join(fonts, "BodoniModa-Italic-Display.ttf"), fontWeight: 500, fontStyle: "italic" },
  ],
});
Font.register({ family: "Fragment", src: path.join(fonts, "FragmentMono-Regular.ttf") });
Font.registerHyphenationCallback((word) => [word]);

const ink = "#1c1c1c";
const soft = "#33322f";
const mute = "#5e5b55";
const rule = "#cfcabe";
const paper = "#fbfaf6";

const s = StyleSheet.create({
  page: { backgroundColor: paper, color: soft, fontFamily: "Bodoni", fontSize: 10.5, lineHeight: 1.5, paddingTop: 64, paddingBottom: 64, paddingHorizontal: 64 },
  footer: { position: "absolute", bottom: 30, left: 64, right: 64, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: mute, fontStyle: "italic" },
  label: { fontStyle: "italic", fontSize: 8, letterSpacing: 1.4, textTransform: "uppercase", color: mute },
  h1: { fontStyle: "italic", fontWeight: 500, fontSize: 120, color: ink, lineHeight: 1 },
  h2: { fontStyle: "italic", fontWeight: 500, fontSize: 40, color: ink, lineHeight: 1.05 },
  h3: { fontStyle: "italic", fontSize: 14, color: ink, marginTop: 18, marginBottom: 6 },
  lead: { fontStyle: "italic", fontSize: 14, color: ink, lineHeight: 1.4 },
  rule: { borderBottomWidth: 0.6, borderBottomColor: rule, marginVertical: 14 },
  mono: { fontFamily: "Fragment", fontSize: 8.5 },
});

const copy = {
  nl: {
    title: "Portfolio",
    subtitle: "Ik bouw software die werk uit handen neemt.",
    index: "Inhoud",
    aboutTitle: "Over mij",
    servicesTitle: "Wat ik voor je kan bouwen",
    proof: "Zie",
    audience: "Voor wie",
    problem: "Het probleem",
    solution: "Wat ik bouwde",
    benefits: "Wat het oplevert",
    craft: "Onder de motorkap",
    challenge: "Het lastigste stuk",
    stack: "Gebouwd met",
    links: "Links",
    page: (n: number, t: number) => `pagina ${n} van ${t}`,
    contact: "Meer werk en contact: github.com/pimdaanbram-prog",
  },
  en: {
    title: "Portfolio",
    subtitle: "I build software that takes work off your hands.",
    index: "Contents",
    aboutTitle: "About me",
    servicesTitle: "What I can build for you",
    proof: "See",
    audience: "Who it is for",
    problem: "The problem",
    solution: "What I built",
    benefits: "What it delivers",
    craft: "Under the hood",
    challenge: "The hardest part",
    stack: "Built with",
    links: "Links",
    page: (n: number, t: number) => `page ${n} of ${t}`,
    contact: "More work and contact: github.com/pimdaanbram-prog",
  },
} as const;

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function Mark({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="flap" x1="0.15" y1="0.2" x2="0.85" y2="0.9">
          <Stop offset="0" stopColor="#e3e1da" />
          <Stop offset="0.55" stopColor="#a8a8a8" />
          <Stop offset="1" stopColor="#6a6a6a" />
        </LinearGradient>
      </Defs>
      <Circle cx="32" cy="32" r="29" fill={paper} stroke={ink} strokeWidth={0.9} />
      <Path d="M12 52 C 22 44 36 26 42 4.5 A 29 29 0 0 1 12 52 Z" fill="url(#flap)" />
      <Path d="M12 52 C 22 44 36 26 42 4.5" fill="none" stroke={ink} strokeWidth={0.9} />
    </Svg>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <View style={s.footer} fixed>
      <Text>Pim · {t.title}</Text>
      <Text render={({ pageNumber, totalPages }) => t.page(pageNumber, totalPages)} />
    </View>
  );
}

function Bullets({ items, marker }: { items: readonly string[]; marker: (n: number) => string }) {
  return (
    <>
      {items.map((line, n) => (
        <View key={n} style={{ flexDirection: "row", marginBottom: 4 }} wrap={false}>
          <Text style={{ width: 22, fontStyle: "italic", color: mute }}>{marker(n)}</Text>
          <Text style={{ flex: 1 }}>{line}</Text>
        </View>
      ))}
    </>
  );
}

function Catalogue({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const byslug = new Map(projects.map((p) => [p.slug, p.name]));
  return (
    <Document title={`Pim · ${t.title}`} author="Pim" subject={t.subtitle} language={lang === "nl" ? "nl-NL" : "en-GB"} creator="pim-world scripts/catalogue.tsx">
      <Page size="A4" style={s.page}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <Text style={s.label}>{t.title}</Text>
            <View style={{ marginTop: 120 }}>
              <Text style={s.h1}>Pim</Text>
              <Text style={[s.lead, { marginTop: 18, maxWidth: 320 }]}>{t.subtitle}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Text style={[s.mono, { color: mute, maxWidth: 260 }]}>{t.contact}</Text>
            <Mark size={150} />
          </View>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>{t.aboutTitle}</Text>
        <View style={s.rule} />
        {about.intro[lang].map((paragraph, n) => (
          <Text key={n} style={{ marginBottom: 10, maxWidth: 420 }}>{paragraph}</Text>
        ))}
        <View style={{ marginTop: 10 }}>
          {facts.filter((fact) => fact.value).map((fact) => (
            <View key={fact.id} style={{ flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: rule }}>
              <Text style={[s.label, { width: 110 }]}>{fact.label[lang]}</Text>
              <Text style={{ flex: 1, fontStyle: "italic", color: ink }}>{fact.value?.[lang]}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.h3, { marginTop: 28 }]}>{t.servicesTitle}</Text>
        {services.map((service) => (
          <View key={service.id} style={{ marginBottom: 10 }} wrap={false}>
            <Text style={{ fontStyle: "italic", fontSize: 12, color: ink }}>{service.title[lang]}</Text>
            <Text>{service.body[lang]}</Text>
            <Text style={{ fontSize: 9, color: mute, fontStyle: "italic" }}>
              {t.proof}: {service.proof.map((slug) => byslug.get(slug)).join(", ")}
            </Text>
          </View>
        ))}
        <Footer lang={lang} />
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>{t.index}</Text>
        <View style={s.rule} />
        {projects.map((project, i) => (
          <Link key={project.slug} src={`#${project.slug}`} style={{ textDecoration: "none", color: soft }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: rule }}>
              <Text style={{ width: 42, fontStyle: "italic", color: mute }}>{roman[i]}</Text>
              <Text style={{ flex: 1, fontStyle: "italic", fontSize: 18, color: ink }}>{project.name}</Text>
              <Text style={{ fontSize: 9, color: mute }}>{project.kind[lang]}</Text>
            </View>
          </Link>
        ))}
        <Footer lang={lang} />
      </Page>

      {projects.map((project, i) => (
        <Page key={project.slug} size="A4" style={s.page} id={project.slug}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontStyle: "italic", fontSize: 16, color: mute, marginRight: 10 }}>{roman[i]}</Text>
            <Text style={s.h2}>{project.name}</Text>
          </View>
          <Text style={[s.label, { marginTop: 14 }]}>
            {project.kind[lang]} · {project.status[lang]}
          </Text>
          <View style={s.rule} />
          <Text style={s.lead}>{project.tagline[lang]}</Text>

          <Text style={s.h3}>{t.audience}</Text>
          <Text>{project.audience[lang]}</Text>
          <Text style={s.h3}>{t.problem}</Text>
          <Text>{project.problem[lang]}</Text>
          <Text style={s.h3}>{t.solution}</Text>
          <Text>{project.solution[lang]}</Text>
          <Text style={s.h3}>{t.benefits}</Text>
          <Bullets items={project.benefits[lang]} marker={(n) => `${n + 1}.`} />
          <Text style={s.h3}>{t.craft}</Text>
          <Bullets items={project.craft[lang]} marker={(n) => `${String.fromCharCode(97 + n)}.`} />
          <View wrap={false}>
            <Text style={s.h3}>{t.challenge}</Text>
            <Text>{project.challenge[lang]}</Text>
          </View>
          <View wrap={false}>
            <Text style={s.h3}>{t.stack}</Text>
            <Text style={[s.mono, { color: soft, lineHeight: 1.7 }]}>{project.stack.join("  ·  ")}</Text>
            {project.links.length > 0 ? (
              <>
                <Text style={s.h3}>{t.links}</Text>
                {project.links.map((link) => (
                  <Link key={link.href} src={link.href} style={{ color: ink, fontSize: 10 }}>
                    {link.label[lang]}: {link.href.replace(/^https?:\/\//, "")}
                  </Link>
                ))}
              </>
            ) : null}
          </View>
          <Footer lang={lang} />
        </Page>
      ))}
    </Document>
  );
}

(async () => {
  for (const lang of ["nl", "en"] as const) {
    const file = path.join(process.cwd(), "public", `portfolio-pim-${lang}.pdf`);
    await renderToFile(<Catalogue lang={lang} />, file);
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
