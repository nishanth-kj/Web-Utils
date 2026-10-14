import { expect, test, type Page } from "@playwright/test";

// The viewer restores each format's draft from sessionStorage on load, which
// lets a test start a page with specific content without typing into Monaco.
async function openViewerWith(page: Page, format: string, content: string) {
    await page.addInitScript(
        ([key, value]) => window.sessionStorage.setItem(key, value),
        [`web-viewer-content-${format}`, content]
    );
    await page.goto(`/view/${format}`);
}

test.describe("preview isolation", () => {
    test("HTML preview scripts can't reach the site's storage or DOM", async ({ page }) => {
        await openViewerWith(
            page,
            "html",
            `<p id="marker">rendered</p>
<script>
  try { parent.document.title = "pwned"; } catch (e) {}
  try { localStorage.setItem("pwned", "1"); document.getElementById("marker").textContent = "storage-open"; }
  catch (e) { document.getElementById("marker").textContent = "storage-blocked"; }
</script>`
        );

        const preview = page.frameLocator('iframe[title="HTML Viewer"]');
        await expect(preview.locator("#marker")).toHaveText("storage-blocked");
        await expect(page.locator('iframe[title="HTML Viewer"]')).not.toHaveAttribute("sandbox", /allow-same-origin/);
        expect(await page.title()).not.toBe("pwned");
        expect(await page.evaluate(() => localStorage.getItem("pwned"))).toBeNull();
    });

    test("SVG preview renders as an image without running scripts", async ({ page }) => {
        await openViewerWith(
            page,
            "svg",
            `<svg width="40" height="40" onload="parent.document.title='pwned'"><script>parent.document.title='pwned'</script><rect width="40" height="40" fill="teal"/></svg>`
        );

        await expect(page.getByRole("img", { name: "SVG preview" })).toBeVisible();
        await page.waitForTimeout(500);
        expect(await page.title()).not.toBe("pwned");
    });
});

test("CSV preview keeps quoted commas in one cell", async ({ page }) => {
    await openViewerWith(page, "csv", 'name,city\n"Smith, John",Paris');
    const cells = page.locator("tbody input");
    await expect(cells.nth(0)).toHaveValue("Smith, John");
    await expect(cells.nth(1)).toHaveValue("Paris");
});

test("format menu only links to generated pages", async ({ page }) => {
    await page.goto("/view/json");
    await page.getByRole("button", { name: "json", exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "TypeScript" })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "YAML" })).toBeVisible();
});
