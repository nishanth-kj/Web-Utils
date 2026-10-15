import { expect, test, type Page } from "@playwright/test";
import { ANALOG_EXAMPLES } from "../../lib/circuit/analog/document";

async function openExample(page: Page, id: string) {
    const circuit = ANALOG_EXAMPLES.find((e) => e.id === id)!.circuit;
    await page.addInitScript((value) => window.sessionStorage.setItem("web-circuit-analog", value), JSON.stringify(circuit));
    await page.goto("/circuit");
}

const part = (page: Page, id: string) => page.locator(`.react-flow__node[data-id="${id}"]`);

test("the button switches the transistor and its LED", async ({ page }) => {
    await openExample(page, "transistor-switch");
    await expect(part(page, "q1")).toContainText("cut off");
    await expect(part(page, "led1")).not.toContainText("mA");

    await page.getByRole("button", { name: "Push button: hold to press", exact: true }).hover();
    await page.mouse.down();
    await expect(part(page, "q1")).toContainText("saturation");
    // (9 V − 2.1 V LED − 0.2 V saturation) / (330 Ω + 10 Ω) ≈ 19.7 mA
    await expect(part(page, "led1")).toContainText(/19\.\d mA/);

    await page.mouse.up();
    await expect(part(page, "q1")).toContainText("cut off");
});

test("collector current is β times the base current", async ({ page }) => {
    await openExample(page, "transistor-gain");
    await expect(part(page, "am1")).toContainText(/\+17\.\d µA/);
    await expect(part(page, "am2")).toContainText(/\+1\.7\d mA/);
    await expect(part(page, "q1")).toContainText("active");
});
