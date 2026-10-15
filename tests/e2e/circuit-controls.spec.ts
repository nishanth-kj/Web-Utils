import { expect, test, type Page } from "@playwright/test";
import { ANALOG_EXAMPLES } from "../../lib/circuit/analog/document";
import { LOGIC_EXAMPLES } from "../../lib/circuit/logic/logic";

const run = (page: Page) => page.getByRole("button", { name: "Run simulation" });
const pause = (page: Page) => page.getByRole("button", { name: "Pause simulation" });
const stop = (page: Page) => page.getByRole("button", { name: "Stop simulation" });

test.describe("analog run / pause / stop", () => {
    test("pause freezes the current, stop clears it, run restores it", async ({ page }) => {
        await page.goto("/circuit");
        const led = page.locator('.react-flow__node[data-id="led1"]');
        await expect(led).toContainText("21.2 mA");

        await pause(page).click();
        await expect(page.getByText(/^Paused: readings are frozen/)).toBeVisible();
        await expect(led).toContainText("21.2 mA");
        const playState = await page.locator(".circuit-flow").first().evaluate((el) => getComputedStyle(el).animationPlayState);
        expect(playState).toBe("paused");

        await stop(page).click();
        await expect(led).not.toContainText("mA");
        await expect(page.locator(".circuit-flow")).toHaveCount(0);

        await run(page).click();
        await expect(led).toContainText("21.2 mA");
        await expect(page.locator(".circuit-flow").first()).toBeAttached();
    });

    test("pausing stops capacitor time", async ({ page }) => {
        const rc = ANALOG_EXAMPLES.find((e) => e.id === "rc")!.circuit;
        const closed = { ...rc, parts: rc.parts.map((p) => (p.kind === "switch" ? { ...p, closed: true } : p)) };
        await page.addInitScript((value) => window.sessionStorage.setItem("web-circuit-analog", value), JSON.stringify(closed));
        await page.goto("/circuit");

        const capacitor = page.locator('.react-flow__node[data-id="c1"]');
        await page.waitForTimeout(800);
        await pause(page).click();
        const frozen = await capacitor.textContent();
        await page.waitForTimeout(1000);
        expect(await capacitor.textContent()).toBe(frozen);

        await run(page).click();
        await page.waitForTimeout(800);
        expect(await capacitor.textContent()).not.toBe(frozen);
    });
});

test.describe("logic run / pause / stop", () => {
    const openLogic = async (page: Page, id: string) => {
        const circuit = LOGIC_EXAMPLES.find((e) => e.id === id)!.circuit;
        await page.addInitScript((value) => {
            window.sessionStorage.setItem("web-circuit-mode", "logic");
            window.sessionStorage.setItem("web-circuit-logic", value);
        }, JSON.stringify(circuit));
        await page.goto("/circuit");
    };

    test("a paused clock holds its LED", async ({ page }) => {
        await openLogic(page, "blinker");
        await page.waitForTimeout(300);
        await pause(page).click();
        const led = page.getByRole("img", { name: /^Y1 is/ });
        const state = await led.getAttribute("aria-label");
        for (let i = 0; i < 4; i++) {
            await page.waitForTimeout(300);
            expect(await led.getAttribute("aria-label")).toBe(state);
        }
    });

    test("stop powers the circuit off until run", async ({ page }) => {
        await openLogic(page, "and");
        await page.getByRole("switch", { name: "Switch A" }).click();
        await page.getByRole("switch", { name: "Switch B" }).click();
        const led = page.getByRole("img", { name: /^Y is/ });
        await expect(led).toHaveAccessibleName("Y is on");

        await stop(page).click();
        await expect(led).toHaveAccessibleName("Y is off");

        await run(page).click();
        await expect(led).toHaveAccessibleName("Y is on");
    });
});
