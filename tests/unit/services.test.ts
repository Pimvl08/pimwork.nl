import { describe, expect, it } from "vitest";
import { visitLine } from "@/content/person";
import { getProject, labProjects, projectHref, projects, workProjects } from "@/content/projects";
import { sampleSites } from "@/content/sample-sites";
import { getService, serviceSummary, services } from "@/content/services";
import { serviceBreadcrumbs, serviceData } from "@/lib/structured-data";

const DASH = /[\u2013\u2014]/;

describe("services content", () => {
  it("has five services with unique slugs", () => {
    expect(services).toHaveLength(5);
    expect(new Set(services.map((s) => s.slug)).size).toBe(services.length);
  });

  it("only points to real work projects and real services", () => {
    for (const service of services) {
      for (const item of service.proof) {
        const project = getProject(item.slug);
        expect(project, item.slug).toBeDefined();
        expect(project?.section).not.toBe("lab");
      }
      if (service.extra) expect(getService(service.extra.service)).toBeDefined();
    }
    for (const project of projects) {
      if (project.service) expect(getService(project.service.slug), project.slug).toBeDefined();
    }
  });

  it("keeps titles and descriptions within what search results show", () => {
    for (const lang of ["nl", "en"] as const) {
      for (const item of [...services.map((s) => s.meta), ...projects.map((p) => p.seo)]) {
        expect(`${item.title[lang]} | PimWork`.length).toBeLessThanOrEqual(62);
        expect(item.description[lang].length).toBeGreaterThanOrEqual(120);
        expect(item.description[lang].length).toBeLessThanOrEqual(158);
      }
    }
  });

  it("uses no em or en dash and never claims clients in the region", () => {
    const text = JSON.stringify([services, projects.map((p) => [p.seo, p.service]), visitLine, sampleSites]);
    expect(text).not.toMatch(DASH);
    expect(text).not.toMatch(/ik werk voor bedrijven|I work for businesses/i);
  });

  it("takes the first sentence of the intro as the card summary", () => {
    const service = getService("systemen-koppelen")!;
    expect(serviceSummary(service, "nl")).toBe("Veel bedrijven werken met pakketten die niet met elkaar praten.");
    expect(serviceSummary(service, "en")).toBe("Many businesses use packages that don't talk to each other.");
  });

  it("only labels made-up sample sites, and starts empty without breaking the page", () => {
    for (const site of sampleSites) expect(site.url).toMatch(/^https:\/\//);
    expect(Array.isArray(sampleSites)).toBe(true);
  });

  it("describes each service with the business as provider and no address", () => {
    for (const service of services) {
      const data = serviceData(service, "nl");
      expect(data["@type"]).toBe("Service");
      expect(JSON.stringify(data)).not.toMatch(/address|straat|postalCode/i);
      const crumbs = serviceBreadcrumbs(service, "en") as { itemListElement: { item: string }[] };
      expect(crumbs.itemListElement.at(-1)?.item).toMatch(new RegExp(`/en/diensten/${service.slug}$`));
    }
  });
});

describe("lab projects", () => {
  it("live under the lab, never on the work pages", () => {
    expect(labProjects.map((p) => p.slug)).toEqual(["solana-forensics"]);
    for (const project of labProjects) expect(projectHref("nl", project)).toBe(`/nl/lab/${project.slug}`);
    for (const project of workProjects) expect(projectHref("en", project)).toBe(`/en/werk/${project.slug}`);
    expect(workProjects.length + labProjects.length).toBe(projects.length);
  });
});
