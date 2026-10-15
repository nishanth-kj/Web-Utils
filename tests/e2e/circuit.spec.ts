import { expect, test, type Page } from "@playwright/test";
import { ANALOG_EXAMPLES, type CircuitDocument } from "../../lib/circuit/analog/document";

async function openCircuitWith(page: Page, doc: CircuitDocument) {
    await page.addInitScript((value) => window.sessionStorage.setItem("web-circuit-analog", value), JSON.stringify(doc));
    await page.goto("/circuit");
}

const example = (id: string) => ANALOG_EXAMPLES.find((e) => e.id === id)!.circuit;

test("solves the default LED circuit", async ({ page }) => {
    await page.goto("/circuit");
    await expect(page.getByRole("heading", { name: "Circuit Simulator" })).toBeVisible();
    await expect(page.locator(".react-flow__node").filter({ hasText: "red LED" })).toContainText("21.2 mA");
    await expect(page.getByRole("alert").filter({ hasText: /short circuit|LED/i })).toHaveCount(0);
});

test("flipping a switch stops the current", async ({ page }) => {
    await openCircuitWith(page, example("bulbs"));
    const battery = page.locator('.react-flow__node[data-id="bat1"]');
    await expect(battery).toContainText("180 mA");

    const toggle = page.locator('.react-flow__node[data-id="sw1"]').getByRole("button");
    await expect(toggle).toHaveAccessibleName("Open switch");
    await toggle.click();
    await expect(battery).toContainText("0 A");
    await expect(toggle).toHaveAccessibleName("Close switch");
});

test("adds a part from the palette", async ({ page }) => {
    await page.goto("/circuit");
    // The default LED example has three parts.
    await expect(page.locator(".react-flow__node")).toHaveCount(3);
    await page.getByRole("button", { name: "Capacitor" }).click();
    await expect(page.locator(".react-flow__node")).toHaveCount(4);
    await expect(page.getByRole("complementary", { name: "Selected part" })).toContainText("Capacitor");
});

test("warns about a short circuit", async ({ page }) => {
    await openCircuitWith(page, {
        parts: [{ id: "bat1", kind: "battery", value: 9, x: 0, y: 0, rotation: 90 }],
        wires: [{ id: "w1", from: "bat1:a", to: "bat1:b" }],
    });
    await expect(page.getByRole("alert").filter({ hasText: "Short circuit" })).toBeVisible();
});

test("a capacitor charges over time", async ({ page }) => {
    const rc = example("rc");
    await openCircuitWith(page, { ...rc, parts: rc.parts.map((p) => (p.kind === "switch" ? { ...p, closed: true } : p)) });
    await expect(page.getByText(/Running · t = \d/)).toBeVisible();

    const capacitor = page.locator(".react-flow__node").filter({ hasText: "1 mF" });
    const volts = async () => Number(((await capacitor.textContent()) ?? "").match(/([\d.]+) (m?)V/)?.[1] ?? 0);
    await page.waitForTimeout(500);
    const early = await volts();
    await page.waitForTimeout(1500);
    expect(await volts()).toBeGreaterThan(early);
});
