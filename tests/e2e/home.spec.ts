import { SERVICE_SLUGS, SLUGS, expect, gotoReady, test, trackErrors } from "./fixtures";

const H1 = "Software, automatisering en websites voor bedrijven in Helmond en omgeving";

test.describe("home", () => {
  test("the hero shows the name, the descriptive h1 and two actions", async ({ page }) => {
    await gotoReady(page, "/nl");
    await expect(page.locator("#cover").getByText("PimWork", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: H1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const cover = page.locator("#cover");
    await expect(cover.getByRole("link", { name: "Bekijk mijn werk" })).toHaveAttribute("href", "/nl/werk");
    await expect(cover.getByRole("link", { name: "Neem contact op" })).toHaveAttribute("href", "/nl/contact");
  });

  test("the first action leads to the work page", async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.locator("#cover").getByRole("link", { name: "Bekijk mijn werk" }).click();
    await expect(page).toHaveURL(/\/nl\/werk$/);
    await expect(page.getByRole("heading", { level: 1, name: /Werk/ })).toBeVisible();
  });

  test("the second action leads to the contact page", async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.locator("#cover").getByRole("link", { name: "Neem contact op" }).click();
    await expect(page).toHaveURL(/\/nl\/contact$/);
    await expect(page.getByRole("form", { name: "Contactformulier" })).toBeVisible();
  });

  test("featured work shows ExactTool, TeamSync and OfferteVlot", async ({ page }) => {
    await gotoReady(page, "/nl");
    const featured = page.getByRole("region", { name: "Uitgelicht werk" });
    for (const name of ["ExactTool", "TeamSync", "OfferteVlot"]) {
      await expect(featured.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(featured.getByRole("listitem")).toHaveCount(3);
  });

  test("a featured project opens as a sheet; Escape closes it and the URL returns", async ({ page }) => {
    const problems = trackErrors(page);
    await gotoReady(page, "/nl");
    const featured = page.getByRole("region", { name: "Uitgelicht werk" });
    await featured.getByRole("link", { name: "TeamSync", exact: true }).click();
    await expect(page).toHaveURL(/\/nl\/werk\/teamsync$/);
    const sheet = page.getByRole("dialog", { name: /TeamSync/ });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "Het probleem" })).toBeVisible();
    // The home page stays underneath.
    await expect(page.getByRole("heading", { level: 1, name: H1 })).toBeAttached();

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/nl$/);
    expect(problems).toEqual([]);
  });

  test("the pager inside the sheet swaps to the next project without errors", async ({ page }) => {
    const problems = trackErrors(page);
    await gotoReady(page, "/nl");
    await page.getByRole("region", { name: "Uitgelicht werk" }).getByRole("link", { name: "TeamSync", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: /TeamSync/ });
    await expect(sheet).toBeVisible();
    const next = sheet.getByRole("navigation", { name: "Andere projecten" }).getByRole("link", { name: /Volgend project/ });
    const href = await next.getAttribute("href");
    await next.scrollIntoViewIfNeeded();
    await next.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("the close button of the sheet also returns to home", async ({ page }) => {
    await gotoReady(page, "/nl");
    await page.getByRole("region", { name: "Uitgelicht werk" }).getByRole("link", { name: "OfferteVlot", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: /OfferteVlot/ });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Sluiten" }).first().click();
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/nl$/);
  });

  test("the services section links to real service and project pages", async ({ page }) => {
    await gotoReady(page, "/nl");
    const services = page.getByRole("region", { name: "Wat ik voor je kan bouwen" });
    const links = services.getByRole("link");
    await expect(links.first()).toBeAttached();
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const [, section, slug] = href.match(/^\/nl\/(werk|diensten)\/([^/]+)$/) ?? [];
      expect(slug, `service link ${href}`).toBeTruthy();
      expect((section === "werk" ? SLUGS : SERVICE_SLUGS) as readonly string[]).toContain(slug);
    }
    for (const slug of SERVICE_SLUGS) expect(hrefs).toContain(`/nl/diensten/${slug}`);
    await links.first().scrollIntoViewIfNeeded();
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`${hrefs[0]}$`));
  });

  test("no Claude Code and no AI chat on the home page", async ({ page }) => {
    await gotoReady(page, "/nl");
    const text = await page.locator("body").innerText();
    expect(text).not.toContain("Claude Code");
    await expect(page.getByRole("textbox")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByRole("region", { name: /machine|vraag|ask|chat/i })).toHaveCount(0);
  });
});
