import { LAB_SLUGS, SERVICE_SLUGS, expect, gotoReady, test } from "./fixtures";

test.describe("services", () => {
  test("the overview lists the five services, each leading to its page", async ({ page }) => {
    await gotoReady(page, "/nl/diensten");
    await expect(page.getByRole("heading", { level: 1, name: "Diensten" })).toBeVisible();
    const main = page.getByRole("main");
    for (const slug of SERVICE_SLUGS) await expect(main.locator(`a[href="/nl/diensten/${slug}"]`)).toBeVisible();
  });

  for (const slug of SERVICE_SLUGS) {
    test(`${slug}: sections, the region and a way to contact`, async ({ page }) => {
      await gotoReady(page, `/nl/diensten/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      for (const title of ["Wat het oplost", "Voor wie", "Hoe ik werk"]) {
        await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
      }
      const text = await page.getByRole("main").innerText();
      expect(text).toContain("Helmond");
      expect(text).toContain("langskomen kan, in overleg");
      await expect(page.getByRole("main").getByRole("link", { name: "Neem contact op" })).toHaveAttribute("href", "/nl/contact");
    });
  }

  test("the website page shows pimwork.nl as the example and no empty sample block", async ({ page }) => {
    await gotoReady(page, "/nl/diensten/website-laten-maken");
    await expect(page.getByRole("heading", { level: 2, name: "Voorbeeld van mijn werk" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Voorbeeldsites" })).toHaveCount(0);
    await expect(page.getByRole("main").locator('a[href="/nl/diensten/offertesoftware"]')).toBeVisible();
  });

  test("a project page links to the service it shows", async ({ page }) => {
    await gotoReady(page, "/nl/werk/offerte-pdf-generator");
    await expect(page.getByRole("heading", { level: 2, name: "Iets vergelijkbaars nodig?" })).toBeVisible();
    await page.getByRole("main").locator('a[href="/nl/diensten/offertesoftware"]').click();
    await expect(page).toHaveURL(/\/nl\/diensten\/offertesoftware$/);
  });
});

test.describe("lab projects", () => {
  for (const slug of LAB_SLUGS) {
    test(`${slug} is listed in the lab and leads back to it`, async ({ page }) => {
      await gotoReady(page, "/nl/lab");
      await expect(page.getByRole("heading", { level: 2, name: "Ook in het lab" })).toBeVisible();
      await page.getByRole("main").locator(`a[href="/nl/lab/${slug}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`/nl/lab/${slug}$`));
      await expect(page.getByRole("main").getByRole("link", { name: "Terug naar het lab" }).first()).toHaveAttribute("href", "/nl/lab");
    });
  }
});
