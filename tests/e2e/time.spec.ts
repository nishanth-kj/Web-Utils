import { expect, test } from "@playwright/test";

// Issue #30: the live clock replaced whatever was typed into the converter
// with the current time on every tick.
test.describe("epoch converter", () => {
    const timestampInput = (page: import("@playwright/test").Page) => page.getByPlaceholder("Enter timestamp or date...");

    test("starts with the live clock paused", async ({ page }) => {
        await page.goto("/time");
        await expect(page.getByRole("button", { name: "Resume live clock" })).toBeAttached();
    });

    test("keeps a typed timestamp", async ({ page }) => {
        await page.goto("/time");
        await timestampInput(page).fill("1700000000");
        await page.waitForTimeout(2500);
        await expect(timestampInput(page)).toHaveValue("1700000000");
    });

    test("typing pauses a running clock", async ({ page }) => {
        await page.goto("/time");
        await page.getByRole("button", { name: "Resume live clock" }).click();
        await expect(page.getByRole("button", { name: "Pause live clock" })).toBeAttached();

        await timestampInput(page).fill("1700000000");
        await page.waitForTimeout(2500);

        await expect(timestampInput(page)).toHaveValue("1700000000");
        await expect(page.getByRole("button", { name: "Resume live clock" })).toBeAttached();
    });
});
