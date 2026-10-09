import { describe, expect, it } from "vitest";
import AppleIcon, { contentType, size } from "@/app/apple-icon";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { labProjects, projectHref, projects } from "@/content/projects";
import { pages } from "@/content/sections";
import { services } from "@/content/services";

describe("site metadata routes", () => {
  it("robots allows the site, hides the API and the egg ledger, links the sitemap", () => {
    const out = robots();
    const rules = Array.isArray(out.rules) ? out.rules[0] : out.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toEqual(["/api/", "/nl/geheim", "/en/geheim"]);
    expect(out.sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it("sitemap lists every page, service and project in both languages with alternates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength((pages.length + services.length + projects.length) * 2);
    const urls = entries.map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/nl"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/en"))).toBe(true);
    for (const path of ["/over", "/lab", "/contact", "/werk", "/diensten", ...services.map((s) => `/diensten/${s.slug}`)]) {
      expect(urls.some((url) => url.endsWith(`/nl${path}`))).toBe(true);
      expect(urls.some((url) => url.endsWith(`/en${path}`))).toBe(true);
    }
    for (const project of projects) {
      const path = projectHref("", project);
      const nl = entries.find((entry) => entry.url.endsWith(`/nl${path.slice(1)}`));
      expect(nl?.alternates?.languages).toMatchObject({
        "nl-NL": expect.stringContaining(`/nl${path.slice(1)}`),
        "en-GB": expect.stringContaining(`/en${path.slice(1)}`),
        "x-default": expect.stringContaining(`/nl${path.slice(1)}`),
      });
    }
    // Lab projects are listed under the lab, never under the work pages.
    for (const project of labProjects) expect(urls.some((url) => url.endsWith(`/werk/${project.slug}`))).toBe(false);
  });

  it("manifest uses the graphite paper colours and the svg icon", () => {
    const out = manifest();
    expect(out).toMatchObject({ name: "PimWork", short_name: "PimWork", start_url: "/nl", display: "standalone" });
    expect(out.background_color).toBe("#121211");
    expect(out.icons?.[0]?.src).toBe("/icon.svg");
  });

  it("apple-icon renders a 180 px PNG", async () => {
    expect(size).toEqual({ width: 180, height: 180 });
    expect(contentType).toBe("image/png");
    const response = AppleIcon();
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
    if (process.env.APPLE_ICON_OUT) (await import("node:fs")).writeFileSync(process.env.APPLE_ICON_OUT, bytes);
  });
});
