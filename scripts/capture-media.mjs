#!/usr/bin/env node
/**
 * Captures REAL media of Pim's own projects for plate 04 (Beeld / Media).
 * Nothing is generated or invented: every file is a screenshot or screen
 * recording of the actual app, or an existing image from a project folder.
 * All sources are used read-only.
 *
 *   node scripts/capture-media.mjs [--only strength,capcraft,offerte,palette,kdp] [--raw <dir>]
 *
 * Local servers the script expects (start them first, stop them afterwards):
 *   npx serve -s "../capcraft/dist" -l 4174
 *   npx serve -l 4175 "../offerte-pdf-generator/dist"
 *   (cd ../paletteforge && npx next start -p 4176)
 * Strength Tracker is captured from its public login screen online.
 *
 * Output: public/media/<project-slug>/<name>.jpg|png|mp4|webm plus a
 * manifest (dimensions, bytes, blur placeholder, duration) printed as JSON
 * and written to <raw>/manifest.json, used to fill src/content/media.ts.
 * Tools: Playwright (installed Chrome), sips (macOS) and /usr/local/bin/ffmpeg.
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "media");
const FFMPEG = "/usr/local/bin/ffmpeg";
const KDP = "/Users/pimvanleeuwen/Projects/KDP-kleurboek";
const KDP_PY = `${KDP}/.venv/bin/python`;

const args = process.argv.slice(2);
const get = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const only = get("only", "strength,capcraft,offerte,palette,kdp").split(",");
const RAW = get("raw", path.join(os.tmpdir(), "pim-media-raw"));
fs.mkdirSync(RAW, { recursive: true });

const manifest = { images: [], videos: [], skipped: [] };
const run = (cmd, argv) => execFileSync(cmd, argv, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const rel = (file) => "/" + path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/");

function dims(file) {
  const out = run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]);
  return {
    width: Number(/pixelWidth: (\d+)/.exec(out)[1]),
    height: Number(/pixelHeight: (\d+)/.exec(out)[1]),
  };
}

/** 16px wide JPEG as a base64 data URL, used as next/image blurDataURL. */
function blur(file) {
  const buf = execFileSync(FFMPEG, [
    "-v", "error", "-i", file, "-vf", "scale=16:-2", "-frames:v", "1",
    "-f", "image2pipe", "-c:v", "mjpeg", "-q:v", "5", "-",
  ]);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/**
 * Converts a raw capture to a compressed web image and records it.
 * crop = { x, y, w, h } in raw pixels (honest framing only, recorded in provenance).
 * png = true keeps line art lossless; gray = true stores it as 8-bit grayscale.
 */
function ship(raw, project, name, { png = false, gray = false, provenance, crop, maxWidth = 2000 } = {}) {
  const dir = path.join(OUT, project);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${name}.${png ? "png" : "jpg"}`);
  const filters = [];
  if (crop) filters.push(`crop=${crop.w ?? "iw"}:${crop.h ?? "ih"}:${crop.x ?? 0}:${crop.y ?? 0}`);
  const cropped = crop ? Math.min(crop.w ?? dims(raw).width, dims(raw).width) : dims(raw).width;
  if (cropped > maxWidth) filters.push(`scale=${maxWidth}:-2:flags=lanczos`);
  const vf = filters.length ? ["-vf", filters.join(",")] : [];
  if (png) {
    run(FFMPEG, ["-y", "-v", "error", "-i", raw, ...vf, "-pix_fmt", gray ? "gray" : "rgb24", "-compression_level", "9", out]);
  } else {
    const tmp = path.join(RAW, `${project}-${name}-framed.png`);
    run(FFMPEG, ["-y", "-v", "error", "-i", raw, ...vf, tmp]);
    run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", tmp, "--out", out]);
  }
  const d = dims(out);
  const entry = { src: rel(out), project, ...d, bytes: fs.statSync(out).size, provenance, blurDataURL: blur(out) };
  manifest.images.push(entry);
  console.log(`image ${entry.src} ${d.width}x${d.height} ${(entry.bytes / 1024).toFixed(0)} KB`);
}

/** Transcodes a Playwright recording to MP4 (H.264) + WebM (VP9) + poster. */
function shipVideo(raw, project, name, { start = 0, duration, posterAt = 2, crop, provenance }) {
  const dir = path.join(OUT, project);
  fs.mkdirSync(dir, { recursive: true });
  const base = path.join(dir, name);
  const trim = ["-ss", String(start), "-i", raw, "-t", String(duration)];
  // Default: 1280 wide. With crop ({ w, h, x, y }) the cropped region keeps its native size.
  const vf = ["-vf", crop ? `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},format=yuv420p` : "scale=1280:-2,format=yuv420p"];
  run(FFMPEG, ["-y", "-v", "error", ...trim, ...vf, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-movflags", "+faststart", "-an", `${base}.mp4`]);
  run(FFMPEG, ["-y", "-v", "error", ...trim, ...vf, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-an", `${base}.webm`]);
  const length = Number(run(FFMPEG.replace(/ffmpeg$/, "ffprobe"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `${base}.mp4`]));
  const at = Math.max(0, Math.min(posterAt, length - 0.4));
  run(FFMPEG, ["-y", "-v", "error", "-ss", String(at), "-i", `${base}.mp4`, "-frames:v", "1", "-q:v", "3", `${base}-poster.jpg`]);
  const probe = run(FFMPEG.replace(/ffmpeg$/, "ffprobe"), [
    "-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", `${base}.mp4`,
  ]);
  const info = JSON.parse(probe);
  const entry = {
    project,
    mp4: rel(`${base}.mp4`),
    webm: rel(`${base}.webm`),
    poster: rel(`${base}-poster.jpg`),
    width: info.streams[0].width,
    height: info.streams[0].height,
    durationSeconds: Math.round(Number(info.format.duration) * 10) / 10,
    mp4Bytes: fs.statSync(`${base}.mp4`).size,
    webmBytes: fs.statSync(`${base}.webm`).size,
    provenance,
  };
  manifest.videos.push(entry);
  console.log(`video ${entry.mp4} ${entry.width}x${entry.height} ${entry.durationSeconds}s ${(entry.mp4Bytes / 1048576).toFixed(2)} MB`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.25 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const pause = (page, ms) => page.waitForTimeout(ms);

async function withPage(options, fn) {
  const context = await browser.newContext({ reducedMotion: "no-preference", ...options });
  const page = await context.newPage();
  try {
    return await fn(page, context);
  } finally {
    await context.close();
  }
}

/** Opens a URL and waits for the network to settle; retries once (free backends sleep). */
async function open(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  } catch {
    await pause(page, 15_000);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  }
}

async function smoothScroll(page, total, steps, stepMs) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, total / steps);
    await pause(page, stepMs);
  }
}

async function step(name, fn) {
  if (!only.includes(name)) return;
  try {
    await fn();
  } catch (error) {
    console.log(`SKIPPED ${name}: ${error.message.split("\n")[0]}`);
    manifest.skipped.push({ name, reason: error.message.split("\n")[0] });
  }
}

/* Strength Tracker: the public login screen of the live site only. */
await step("strength", async () => {
  const url = "https://strengttracker.netlify.app";
  for (const [label, opts] of [["login-desktop", DESKTOP], ["login-phone", PHONE]]) {
    await withPage(opts, async (page) => {
      await open(page, url);
      await page.locator("input, form, button").first().waitFor({ timeout: 30_000 });
      await pause(page, 1500);
      const raw = path.join(RAW, `strength-${label}.png`);
      await page.screenshot({ path: raw });
      ship(raw, "strength-tracker", label, { provenance: `Playwright screenshot (Chrome, ${opts.viewport.width}x${opts.viewport.height} @${opts.deviceScaleFactor}x) of the public login screen at ${url}` });
    });
  }
});

/* CapCraft: its own dist/ build served locally, both of its themes. */
await step("capcraft", async () => {
  const base = "http://localhost:4174";
  const pages = [["home", "/"], ["products", "/products"], ["product", "/products/donk-baseball-cap"]];
  for (const theme of ["dark", "light"]) {
    for (const [device, opts] of [["desktop", DESKTOP], ["phone", PHONE]]) {
      await withPage({ ...opts, colorScheme: theme }, async (page, context) => {
        await context.addInitScript((t) => localStorage.setItem("capcraft.theme", t), theme);
        for (const [name, route] of pages) {
          await open(page, base + route);
          await pause(page, 1800);
          const raw = path.join(RAW, `capcraft-${name}-${device}-${theme}.png`);
          await page.screenshot({ path: raw });
          ship(raw, "capcraft", `${name}-${device}-${theme}`, {
            provenance: `Playwright screenshot (Chrome, ${opts.viewport.width}x${opts.viewport.height} @${opts.deviceScaleFactor}x, theme ${theme}) of ${route} in capcraft/dist served with: npx serve -s capcraft/dist -l 4174`,
          });
        }
      });
    }
  }
  // Scroll recording of the home page.
  const dir = path.join(RAW, "video-capcraft");
  fs.rmSync(dir, { recursive: true, force: true });
  await withPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark", recordVideo: { dir, size: { width: 1280, height: 800 } } }, async (page, context) => {
    await context.addInitScript(() => localStorage.setItem("capcraft.theme", "dark"));
    await open(page, base + "/");
    await pause(page, 2500);
    await page.mouse.move(640, 400);
    await smoothScroll(page, 3600, 60, 160);
    await pause(page, 1200);
    await smoothScroll(page, -3600, 30, 90);
    await pause(page, 1500);
  });
  const raw = fs.readdirSync(dir).find((f) => f.endsWith(".webm"));
  shipVideo(path.join(dir, raw), "capcraft", "home-scroll", {
    start: 2.6, duration: 14, posterAt: 0.3,
    provenance: "Playwright recordVideo (Chrome, 1280x800) of scrolling the home page of capcraft/dist served with npx serve, transcoded with ffmpeg",
  });
});

/* OfferteVlot: its dist/ build. The app opens with its own placeholder quote;
   that is overwritten with clearly fictional example data and every phone,
   e-mail, KvK, BTW and IBAN field is cleared so no contact data is visible. */
await step("offerte", async () => {
  const url = "http://localhost:4175";
  const desc = (page) => page.getByPlaceholder("Bijv. Leveren en aanbrengen dakpannen");
  const price = (page) => page.getByPlaceholder("0,00");
  const prepare = async (page) => {
    await page.getByLabel("Bedrijfsnaam").fill("Voorbeeld Dakwerken");
    await page.getByRole("textbox", { name: /^Adres/ }).fill("Voorbeeldstraat 12\n1234 AB Voorbeeldstad");
    for (const label of ["KvK-nummer", "BTW-nummer", "IBAN"]) await page.getByLabel(label).fill("");
    for (const label of ["Telefoon", "E-mail"]) {
      const fields = page.getByLabel(label);
      for (let i = 0; i < (await fields.count()); i++) await fields.nth(i).fill("");
    }
    await page.getByLabel("Naam klant").fill("Jan Voorbeeld");
    await page.getByRole("textbox", { name: /^Factuuradres/ }).fill("Proefweg 3\n5678 CD Voorbeelddorp");
    await page.getByRole("button", { name: /Offertegegevens/ }).click();
    await page.getByLabel(/Inleiding/).fill("Dank voor de aanvraag. Hieronder staat de prijsopgave voor de dakgoot en de nok. Dit is een voorbeeldofferte met verzonnen gegevens.");
    await page.getByRole("button", { name: /Offertegegevens/ }).click();
    while ((await desc(page).count()) > 1) await page.getByRole("button", { name: "Regel verwijderen" }).last().click();
    await desc(page).nth(0).fill("");
    await price(page).nth(0).fill("");
  };
  const typeItem = async (page, i, [text, qty, unit, amount], slow) => {
    await page.locator("select:has(option[value='post'])").nth(i).selectOption(unit);
    await page.getByPlaceholder("0", { exact: true }).nth(i).fill(qty);
    await desc(page).nth(i).click();
    await page.keyboard.type(text, { delay: slow ? 65 : 0 });
    await price(page).nth(i).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type(amount, { delay: slow ? 160 : 0 });
  };
  const items = [
    ["Dakgoot vervangen (zink)", "12", "m\u00b9", "57"],
    ["Nokvorsten opnieuw invoegen", "1", "post", "240"],
    ["Arbeidsloon dakdekker", "2", "dag", "480"],
  ];
  const fillItems = async (page, slow = false) => {
    for (const [i, item] of items.entries()) {
      if (i > 0) await page.getByRole("button", { name: "Regel toevoegen" }).click();
      await typeItem(page, i, item, slow);
      if (slow) await pause(page, 1100);
    }
  };
  const credit = "fictional example data (Voorbeeld Dakwerken, Jan Voorbeeld), contact fields cleared";
  await withPage(DESKTOP, async (page) => {
    await open(page, url);
    await prepare(page);
    await fillItems(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await pause(page, 1200);
    const raw = path.join(RAW, "offerte-editor-desktop.png");
    await page.screenshot({ path: raw });
    ship(raw, "offerte-pdf-generator", "editor-desktop", { provenance: `Playwright screenshot (Chrome, 1440x900 @1.25x) of offerte-pdf-generator/dist served with npx serve -l 4175, ${credit}` });
    const a4 = page.locator(".shadow-page").first();
    await a4.scrollIntoViewIfNeeded();
    await pause(page, 600);
    const rawA4 = path.join(RAW, "offerte-a4-preview.png");
    await a4.screenshot({ path: rawA4 });
    ship(rawA4, "offerte-pdf-generator", "a4-preview", { provenance: `Playwright element screenshot of the live A4 preview in offerte-pdf-generator/dist (npx serve -l 4175), ${credit}` });
  });
  await withPage(PHONE, async (page) => {
    await open(page, url);
    await prepare(page);
    await fillItems(page);
    await page.getByText("Offerteregels", { exact: true }).first().evaluate((el) => {
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 140);
    });
    await pause(page, 1000);
    const raw = path.join(RAW, "offerte-items-phone.png");
    await page.screenshot({ path: raw });
    ship(raw, "offerte-pdf-generator", "items-phone", { provenance: `Playwright screenshot (Chrome, 390x844 @2x) of the line items editor in offerte-pdf-generator/dist (npx serve -l 4175), ${credit}` });
  });
  // Recording: typing line items while the A4 preview updates beside them.
  const dir = path.join(RAW, "video-offerte");
  fs.rmSync(dir, { recursive: true, force: true });
  let start = 0;
  await withPage({ viewport: { width: 1280, height: 800 }, recordVideo: { dir, size: { width: 1280, height: 800 } } }, async (page) => {
    const t0 = Date.now();
    await open(page, url);
    await prepare(page);
    await desc(page).nth(0).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -140));
    await pause(page, 900);
    start = (Date.now() - t0) / 1000 - 0.4;
    await fillItems(page, true);
    await pause(page, 3500);
  });
  const raw = fs.readdirSync(dir).find((f) => f.endsWith(".webm"));
  shipVideo(path.join(dir, raw), "offerte-pdf-generator", "line-item", {
    start, duration: 15, posterAt: 14,
    provenance: `Playwright recordVideo (Chrome, 1280x800) of typing three line items in offerte-pdf-generator/dist (npx serve -l 4175), ${credit}, transcoded with ffmpeg`,
  });
});

/* PaletteForge: its production build (.next) started with next start. That
   build renders its desktop container uncentred (a Tailwind 4 setup issue in
   the project), so the desktop landing shot is cropped to the hero and the
   palette demo, and the recording uses a tablet-width viewport. */
await step("palette", async () => {
  const base = "http://localhost:4176";
  const server = "paletteforge production build started with: npx next start -p 4176";
  await withPage(DESKTOP, async (page) => {
    await open(page, base + "/");
    await pause(page, 1500);
    let raw = path.join(RAW, "palette-landing-desktop.png");
    await page.screenshot({ path: raw });
    ship(raw, "paletteforge", "landing-desktop", { crop: { x: 0, y: 70, w: 1040, h: 880 }, provenance: `Playwright screenshot (Chrome, 1440x900 @1.25x) of the landing page with the live palette demo, cropped to the hero (x 0, y 70, 1040x880 px) with ffmpeg; ${server}` });
    await open(page, base + "/producten");
    await pause(page, 1500);
    raw = path.join(RAW, "palette-templates-desktop.png");
    await page.screenshot({ path: raw });
    ship(raw, "paletteforge", "templates-desktop", { crop: { x: 0, y: 140, w: 1800, h: 720 }, provenance: `Playwright screenshot (Chrome, 1440x900 @1.25x) of /producten (palette templates), cropped to the search bar and template grid (y 140, 1800x720 px) with ffmpeg; ${server}` });
  });
  await withPage(PHONE, async (page) => {
    await open(page, base + "/");
    await pause(page, 1500);
    const raw = path.join(RAW, "palette-landing-phone.png");
    await page.screenshot({ path: raw });
    ship(raw, "paletteforge", "landing-phone", { provenance: `Playwright screenshot (Chrome, 390x844 @2x) of the landing page; ${server}` });
  });
  const dir = path.join(RAW, "video-palette");
  fs.rmSync(dir, { recursive: true, force: true });
  let start = 0;
  await withPage({ viewport: { width: 1280, height: 800 }, recordVideo: { dir, size: { width: 1280, height: 800 } } }, async (page) => {
    const t0 = Date.now();
    await open(page, base + "/");
    await pause(page, 1200);
    const button = page.getByRole("button", { name: /Genereer nieuw/ }).first();
    start = (Date.now() - t0) / 1000 - 0.3;
    for (let i = 0; i < 7; i++) {
      await pause(page, 1100);
      await button.click();
      await pause(page, 700);
    }
    await pause(page, 1000);
  });
  const raw = fs.readdirSync(dir).find((f) => f.endsWith(".webm"));
  shipVideo(path.join(dir, raw), "paletteforge", "generate", {
    start, duration: 13, posterAt: 6, crop: { w: 720, h: 680, x: 0, y: 60 },
    provenance: `Playwright recordVideo (Chrome, 1280x800) of clicking Genereer nieuw on the landing page, cropped to the hero and palette demo (720x680 at x 0, y 60) with ffmpeg; ${server}`,
  });
});

/* KDP coloring book: existing project images, checked by eye first. The
   preview spreads (pen name) and anything under bnb/ or proef/ are excluded. */
await step("kdp", async () => {
  ship(`${KDP}/style/character-sheet.png`, "kdp-kleurboek", "character-sheet", { png: true, gray: true, provenance: "Existing file KDP-kleurboek/style/character-sheet.png (character sheet of the five animals)" });
  ship(`${KDP}/qc/overlay/p02.png`, "kdp-kleurboek", "qc-overlay-p02", { png: true, provenance: "Existing file KDP-kleurboek/qc/overlay/p02.png (quality check overlay, red marks small closed areas)" });
  ship(`${KDP}/qc/contact-sheet-vervangronde.png`, "kdp-kleurboek", "contact-sheet", {
    provenance: "Existing file KDP-kleurboek/qc/contact-sheet-vervangronde.png, top 92 px (the title line) cropped off and scaled to 1400 px with ffmpeg",
    crop: { y: 92, h: 1386 },
    maxWidth: 1400,
  });
  for (const plate of ["p05", "p12"]) {
    const raw = path.join(RAW, `kdp-${plate}.png`);
    run(KDP_PY, ["-c", [
      "import fitz, sys",
      `doc = fitz.open(${JSON.stringify(`${KDP}/clean/${plate}.pdf`)})`,
      "page = doc[0]",
      "zoom = 1400 / page.rect.width",
      "pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csGRAY, alpha=False)",
      `pix.save(${JSON.stringify(raw)})`,
    ].join("\n")]);
    ship(raw, "kdp-kleurboek", `plate-${plate}`, { png: true, gray: true, provenance: `Rendered from KDP-kleurboek/clean/${plate}.pdf to PNG (1400 px wide, grayscale) with PyMuPDF from the project's own .venv, read-only` });
  }
});

await browser.close();
fs.writeFileSync(path.join(RAW, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`manifest: ${path.join(RAW, "manifest.json")}`);
if (manifest.skipped.length) console.log("skipped:", JSON.stringify(manifest.skipped));
