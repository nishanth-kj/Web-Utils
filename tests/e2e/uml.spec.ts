import { expect, test, type Page } from "@playwright/test";
import { UML_SAMPLES } from "../../lib/uml/samples";

async function openUmlWith(page: Page, source: string) {
    await page.addInitScript((value) => window.sessionStorage.setItem("web-uml-source", value), source);
    await page.goto("/uml");
}

const diagram = (page: Page) => page.getByRole("img", { name: "Rendered UML diagram" });

for (const sample of UML_SAMPLES) {
    test(`renders the ${sample.label.toLowerCase()} example`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));

        await openUmlWith(page, sample.source);

        await expect(diagram(page)).toBeVisible({ timeout: 20_000 });
        await expect(page.getByRole("alert", { name: "Diagram syntax error" })).toHaveCount(0);
        const size = await diagram(page).evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
        expect(size[0]).toBeGreaterThan(50);
        expect(size[1]).toBeGreaterThan(50);
        expect(errors).toEqual([]);
    });
}

test("reports syntax errors with the line", async ({ page }) => {
    await openUmlWith(page, "sequenceDiagram\n    Alice->>: missing target");
    await expect(page.getByRole("alert", { name: "Diagram syntax error" })).toContainText(/line 2/i, { timeout: 20_000 });
});

test("zoom controls change the zoom level and fit restores it", async ({ page }) => {
    await openUmlWith(page, UML_SAMPLES[0].source);
    await expect(diagram(page)).toBeVisible({ timeout: 20_000 });

    const level = page.getByRole("button", { name: /^Zoom \d+ percent/ });
    const fitted = await level.textContent();

    await page.getByRole("button", { name: "Zoom in" }).click();
    await expect(level).not.toHaveText(fitted ?? "");

    await page.getByRole("button", { name: "Fit diagram to panel" }).click();
    await expect(level).toHaveText(fitted ?? "");
});
