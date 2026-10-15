import { expect, test, type Page } from "@playwright/test";
import { LOGIC_EXAMPLES } from "../../lib/circuit/logic/logic";

async function openLogic(page: Page, id: string) {
    const circuit = LOGIC_EXAMPLES.find((e) => e.id === id)!.circuit;
    await page.addInitScript((value) => {
        window.sessionStorage.setItem("web-circuit-mode", "logic");
        window.sessionStorage.setItem("web-circuit-logic", value);
    }, JSON.stringify(circuit));
    await page.goto("/circuit");
}

test("a D flip-flop latches D on the clock edge", async ({ page }) => {
    await openLogic(page, "d-flip-flop");
    const q = page.getByRole("img", { name: /^Q is (on|off)$/ });
    await expect(q).toHaveAccessibleName("Q is off");

    await page.getByRole("switch", { name: "Switch D" }).click();
    await expect(q).toHaveAccessibleName("Q is off");

    const clock = page.getByRole("button", { name: "Push button CLK: hold to press", exact: true });
    await clock.hover();
    await page.mouse.down();
    await page.mouse.up();
    await expect(q).toHaveAccessibleName("Q is on");

    await page.getByRole("switch", { name: "Switch D" }).click();
    await page.waitForTimeout(200);
    await expect(q).toHaveAccessibleName("Q is on");
});

test("the counter counts up on the 7-segment display", async ({ page }) => {
    await openLogic(page, "counter");
    const display = page.getByRole("img", { name: /^COUNT shows / });
    const seen = new Set<string | null>();
    for (let i = 0; i < 10; i++) {
        seen.add(await display.getAttribute("aria-label"));
        await page.waitForTimeout(200);
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
});

test("the timing diagram traces inputs and flip-flops", async ({ page }) => {
    await openLogic(page, "counter");
    await page.getByRole("button", { name: "Timing diagram" }).click();
    const diagram = page.getByRole("region", { name: "Timing diagram" });
    await expect(diagram).toBeVisible();
    await expect(diagram).toContainText("CLK");
    await expect(diagram).toContainText("FF1.Q");
    await expect(diagram.locator("path")).toHaveCount(6);
});
