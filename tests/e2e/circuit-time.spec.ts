import { expect, test, type Page } from "@playwright/test";
import { ANALOG_EXAMPLES } from "../../lib/circuit/analog/document";

async function openExample(page: Page, id: string, patch?: (p: { kind: string }) => object) {
    const circuit = ANALOG_EXAMPLES.find((e) => e.id === id)!.circuit;
    const parts = patch ? circuit.parts.map((p) => ({ ...p, ...patch(p) })) : circuit.parts;
    await page.addInitScript((value) => window.sessionStorage.setItem("web-circuit-analog", value), JSON.stringify({ ...circuit, parts }));
    await page.goto("/circuit");
}

const part = (page: Page, id: string) => page.locator(`.react-flow__node[data-id="${id}"]`);

// Reads the scope's live channel values, e.g. "A 4.2 V" / "B -1 mV".
async function channelValues(page: Page) {
    const text = (await part(page, "osc1").textContent()) ?? "";
    const parse = (channel: string) => {
        const match = new RegExp(`${channel} (-?[\\d.]+) (m|µ|n)?V`).exec(text);
        if (!match) return null;
        const scale = { m: 1e-3, µ: 1e-6, n: 1e-9 }[match[2] as "m" | "µ" | "n"] ?? 1;
        return Number(match[1]) * scale;
    };
    return { a: parse("A"), b: parse("B") };
}

test("the scope shows a half-wave rectified output", async ({ page }) => {
    await openExample(page, "rectifier");
    await expect(page.getByRole("img", { name: "OSC1 screen" })).toBeVisible();
    await expect(part(page, "osc1").locator("polyline")).toHaveCount(2, { timeout: 5_000 });

    const inputs: number[] = [];
    const outputs: number[] = [];
    for (let i = 0; i < 12; i++) {
        const { a, b } = await channelValues(page);
        if (a !== null) inputs.push(a);
        if (b !== null) outputs.push(b);
        await page.waitForTimeout(90);
    }
    expect(Math.min(...inputs)).toBeLessThan(-1);
    expect(Math.max(...inputs)).toBeGreaterThan(1);
    expect(Math.min(...outputs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...outputs)).toBeGreaterThan(1);
});

test("AC current reverses direction", async ({ page }) => {
    await openExample(page, "ac-lamp");
    const directions = new Set<string>();
    for (let i = 0; i < 15; i++) {
        const direction = await page
            .locator(".circuit-flow")
            .first()
            .evaluate((el) => (el as SVGElement).style.animationDirection)
            .catch(() => "");
        if (direction) directions.add(direction);
        await page.waitForTimeout(100);
    }
    expect(directions).toEqual(new Set(["normal", "reverse"]));
});

test("inductor current builds up after the switch closes", async ({ page }) => {
    await openExample(page, "rl");
    const ammeter = part(page, "am1");
    await page.getByRole("button", { name: "Close switch", exact: true }).click();
    const milliamps = async () => {
        const match = /\+?([\d.]+) (m)?A/.exec((await ammeter.textContent()) ?? "");
        return match ? Number(match[1]) * (match[2] ? 1 : 1000) : 0;
    };
    await page.waitForTimeout(100);
    const early = await milliamps();
    await page.waitForTimeout(900);
    const later = await milliamps();
    expect(later).toBeGreaterThan(early);
    expect(later).toBeGreaterThan(500);
});

test("changing time per division updates the scope", async ({ page }) => {
    await openExample(page, "rectifier");
    await part(page, "osc1").click();
    await page.getByLabel("Time / division").click();
    await page.getByRole("option", { name: "20 ms/div" }).click();
    await expect(part(page, "osc1")).toContainText("20 ms/div");
});
