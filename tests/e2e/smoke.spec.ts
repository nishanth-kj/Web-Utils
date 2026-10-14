import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// Every URL we ask search engines to index must load, have a heading, and
// not throw — read straight from the built sitemap so new pages are covered
// automatically.
const sitemap = readFileSync(join(process.cwd(), "out", "sitemap.xml"), "utf8");
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);

test("sitemap lists pages", () => {
    expect(paths.length).toBeGreaterThan(10);
});

for (const path of paths) {
    test(`loads ${path}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1").first()).toBeAttached();
        // Previews pull CDN assets indefinitely, so "networkidle" never settles;
        // give hydration and lazy chunks a moment to surface errors instead.
        await page.waitForLoadState("load");
        await page.waitForTimeout(1000);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
    });
}

test("unknown routes return the 404 page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
});
