import { expect, test, type Page } from "@playwright/test";
import { LOGIC_EXAMPLES, type LogicDocument } from "../../lib/circuit/logic/logic";

async function openLogicWith(page: Page, doc: LogicDocument) {
    await page.addInitScript((value) => {
        window.sessionStorage.setItem("web-circuit-mode", "logic");
        window.sessionStorage.setItem("web-circuit-logic", value);
    }, JSON.stringify(doc));
    await page.goto("/circuit");
}

const example = (id: string) => LOGIC_EXAMPLES.find((e) => e.id === id)!.circuit;
const led = (page: Page, name: string) => page.getByRole("img", { name: new RegExp(`^${name} is (on|off)$`) });
const toggle = (page: Page, name: string) => page.getByRole("switch", { name: `Switch ${name}` });

test("the half adder adds and its truth table highlights the current row", async ({ page }) => {
    await page.goto("/circuit");
    await page.getByRole("tab", { name: "Logic gates" }).click();

    await expect(led(page, "Sum")).toHaveAccessibleName("Sum is off");
    const table = page.getByRole("table");
    await expect(table).toContainText("Carry");
    await expect(table.locator("tbody tr")).toHaveCount(4);

    await toggle(page, "A").click();
    await expect(led(page, "Sum")).toHaveAccessibleName("Sum is on");
    await expect(led(page, "Carry")).toHaveAccessibleName("Carry is off");
    // A=1, B=0 → Sum=1, Carry=0
    await expect(table.locator('tr[aria-current="true"]')).toHaveText("1010");

    await toggle(page, "B").click();
    await expect(led(page, "Sum")).toHaveAccessibleName("Sum is off");
    await expect(led(page, "Carry")).toHaveAccessibleName("Carry is on");
});

test("the SR latch remembers after the input is released", async ({ page }) => {
    await openLogicWith(page, example("sr-latch"));
    await toggle(page, "S").click();
    await toggle(page, "S").click();
    await expect(led(page, "Q")).toHaveAccessibleName("Q is on");

    await toggle(page, "R").click();
    await toggle(page, "R").click();
    await expect(led(page, "Q")).toHaveAccessibleName("Q is off");
    await expect(page.getByText(/has feedback/)).toBeVisible();
});

test("a clock blinks its LED", async ({ page }) => {
    await openLogicWith(page, example("blinker"));
    const states = new Set<string | null>();
    for (let i = 0; i < 6; i++) {
        states.add(await led(page, "Y1").getAttribute("aria-label"));
        await page.waitForTimeout(250);
    }
    expect(states).toEqual(new Set(["Y1 is on", "Y1 is off"]));
});

test("warns when a feedback loop oscillates", async ({ page }) => {
    await openLogicWith(page, {
        parts: [{ id: "n1", kind: "not", x: 0, y: 0 }],
        wires: [{ id: "w1", from: "n1:out", to: "n1:in0" }],
    });
    await expect(page.getByRole("alert").filter({ hasText: "oscillates" })).toBeVisible();
});

test("#logic opens the logic mode directly", async ({ page }) => {
    await page.goto("/circuit#logic");
    await expect(page.getByRole("tab", { name: "Logic gates" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("table")).toBeVisible();
});
