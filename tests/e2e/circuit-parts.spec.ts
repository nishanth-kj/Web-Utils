import { expect, test, type Page } from "@playwright/test";
import { ANALOG_EXAMPLES } from "../../lib/circuit/analog/document";

async function openExample(page: Page, id: string) {
    const circuit = ANALOG_EXAMPLES.find((e) => e.id === id)!.circuit;
    await page.addInitScript((value) => window.sessionStorage.setItem("web-circuit-analog", value), JSON.stringify(circuit));
    await page.goto("/circuit");
}

const part = (page: Page, id: string) => page.locator(`.react-flow__node[data-id="${id}"]`);

test("meters read the series current and the voltage across a resistor", async ({ page }) => {
    await openExample(page, "meters");
    await expect(part(page, "am1")).toContainText("+3 mA");
    await expect(part(page, "vm1")).toContainText("+6 V");
});

test("holding the button blows the fuse until the simulation restarts", async ({ page }) => {
    await openExample(page, "fuse");
    await expect(part(page, "lamp1")).toContainText("89.9 mA");

    const button = page.getByRole("button", { name: "Push button: hold to press", exact: true });
    await button.hover();
    await page.mouse.down();
    await expect(part(page, "fu1")).toContainText("BLOWN");
    await page.mouse.up();
    await expect(part(page, "fu1")).toContainText("BLOWN");
    await expect(part(page, "lamp1")).not.toContainText("mA");

    await page.getByRole("button", { name: "Stop simulation" }).click();
    await page.getByRole("button", { name: "Run simulation" }).click();
    await expect(part(page, "lamp1")).toContainText("89.9 mA");
    await expect(part(page, "fu1")).not.toContainText("BLOWN");
});

test("turning the potentiometer up brightens the bulb", async ({ page }) => {
    await openExample(page, "dimmer");
    const lamp = part(page, "lamp1");
    await expect(part(page, "rv1")).toContainText("20%");
    const before = await lamp.textContent();

    await page.getByRole("button", { name: "Turn RV1 up", exact: true }).click();
    await expect(part(page, "rv1")).toContainText("30%");
    await expect(lamp).not.toHaveText(before ?? "");
});

test("the Zener holds the load near 5.1 V", async ({ page }) => {
    await openExample(page, "zener");
    await expect(part(page, "vm1")).toContainText(/\+5\.1\d? V/);
});

test("the motor spins while current flows", async ({ page }) => {
    await openExample(page, "motor");
    await expect(part(page, "m1").locator(".circuit-spin")).toHaveCount(1);
    await page.getByRole("button", { name: "Open switch", exact: true }).click();
    await expect(part(page, "m1").locator(".circuit-spin")).toHaveCount(0);
});
