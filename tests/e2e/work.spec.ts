import { SLUGS, expect, gotoReady, test, trackErrors } from "./fixtures";

const NAMES = ["ExactTool", "TeamSync", "OfferteVlot", "WordPress-koppeling", "Strength Tracker", "Belhulp", "Kleurboek"];
/** Projects whose "hardest part" is not written yet; the section is hidden until it is. */
const NO_CHALLENGE = new Set<string>(["exact-online", "wordpress-koppeling"]);
const SECTIONS = ["Voor wie", "Het probleem", "Wat ik bouwde", "Wat het oplevert", "Onder de motorkap", "Het lastigste stuk"];
/** A plausible calendar year (1980 to 2039) standing on its own. */
const YEAR = /(?<![\d.,])(19[89]\d|20[0-3]\d)(?![\d.,])/;

test.describe("work index", () => {
  test("lists the seven projects and nothing else", async ({ page }) => {
    await gotoReady(page, "/nl/werk");
    const list = page.getByRole("list", { name: "Projecten" });
    await expect(list).toBeVisible();
    await expect(list.getByRole("listitem")).toHaveCount(NAMES.length);
    for (const name of NAMES) {
      await expect(list.getByRole("link", { name: new RegExp(name) })).toBeVisible();
    }
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/CapCraft|PaletteForge|Solana/i);
  });

  test("a project in the index opens as a sheet and Escape returns to the index", async ({ page }) => {
    await gotoReady(page, "/nl/werk");
    await page.getByRole("list", { name: "Projecten" }).getByRole("link", { name: /Belhulp/ }).click();
    await expect(page).toHaveURL(/\/nl\/werk\/belhulp$/);
    const sheet = page.getByRole("dialog", { name: /Belhulp/ });
    await expect(sheet).toBeVisible();
    // The sheet takes focus in the same commit that registers its Escape handler.
    await expect(sheet).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/nl\/werk$/);
  });
});

test.describe("project pages", () => {
  for (const slug of SLUGS) {
    test(`${slug}: all sections and no years`, async ({ page }) => {
      await gotoReady(page, `/nl/werk/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const title of SECTIONS.filter((s) => !NO_CHALLENGE.has(slug) || s !== "Het lastigste stuk")) {
        await expect(page.getByRole("heading", { level: 2, name: title, exact: true }), `section ${title}`).toBeVisible();
      }
      const text = await page.getByRole("main").innerText();
      expect(text.match(YEAR)?.[0], "a four-digit year on the page").toBeUndefined();
      expect(text).not.toContain("Claude Code");
      expect(text).not.toContain("Nog in te vullen");
    });
  }

  for (const slug of ["kdp-kleurboek", "offerte-pdf-generator"]) {
    test(`${slug}: a screenshot opens in a lightbox and Escape closes it`, async ({ page }) => {
      await gotoReady(page, `/nl/werk/${slug}`);
      const thumbs = page.getByRole("list", { name: "Schermafbeeldingen" });
      const first = thumbs.getByRole("button", { name: /^Vergroot: / }).first();
      await first.scrollIntoViewIfNeeded();
      await first.click();
      const lightbox = page.getByRole("dialog", { name: "Beeldweergave" });
      await expect(lightbox).toBeVisible();
      await expect(lightbox.getByRole("button", { name: "Sluiten" })).toBeFocused();
      await expect(lightbox.locator("img").first()).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(lightbox).toBeHidden();
      await expect(first).toBeFocused();
    });
  }

  test("the pager on a project page leads to the next project without errors", async ({ page }) => {
    const problems = trackErrors(page);
    await gotoReady(page, "/nl/werk/teamsync");
    const pager = page.getByRole("navigation", { name: "Andere projecten" });
    const next = pager.getByRole("link", { name: /Volgend project/ });
    const href = await next.getAttribute("href");
    expect(href).toMatch(/^\/nl\/werk\/[a-z-]+$/);
    await next.scrollIntoViewIfNeeded();
    await next.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { name: "Het probleem" }).last()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("Strength Tracker links to the live app safely", async ({ page }) => {
    await gotoReady(page, "/nl/werk/strength-tracker");
    const live = page.getByRole("link", { name: /Open de app/ });
    await expect(live).toHaveAttribute("href", /^https:\/\/.+netlify\.app/);
    await expect(live).toHaveAttribute("target", "_blank");
    await expect(live).toHaveAttribute("rel", /noopener/);
    await expect(live).toHaveAttribute("rel", /noreferrer/);
  });

  test("every external link on a project page opens safely", async ({ page }) => {
    await gotoReady(page, "/nl/werk/strength-tracker");
    const unsafe = await page.locator('a[href^="http"]').evaluateAll((links) =>
      links
        .filter((a) => !(a.getAttribute("rel") ?? "").includes("noopener"))
        .map((a) => a.getAttribute("href")),
    );
    expect(unsafe).toEqual([]);
  });
});
