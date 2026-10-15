import { describe, expect, it } from "vitest";
import {
    LOGIC_EXAMPLES,
    hasFeedback,
    parseLogicDocument,
    simulateLogic,
    truthTable,
    type LogicPart,
    type LogicWire,
} from "@/lib/circuit/logic/logic";

const example = (id: string) => LOGIC_EXAMPLES.find((e) => e.id === id)!.circuit;
const withSwitches = (parts: LogicPart[], values: Record<string, boolean>) =>
    parts.map((part) => (part.kind === "switch" ? { ...part, on: values[part.id] ?? false } : part));

describe("simulateLogic", () => {
    it.each([
        ["and", [false, false, false, true]],
        ["or", [false, true, true, true]],
        ["nand", [true, true, true, false]],
        ["nor", [true, false, false, false]],
        ["xor", [false, true, true, false]],
        ["xnor", [true, false, false, true]],
    ] as const)("evaluates %s", (kind, expected) => {
        const parts: LogicPart[] = [
            { id: "a", kind: "switch" },
            { id: "b", kind: "switch" },
            { id: "g", kind },
            { id: "y", kind: "led" },
        ];
        const wires: LogicWire[] = [
            { id: "w1", from: "a:out", to: "g:in0" },
            { id: "w2", from: "b:out", to: "g:in1" },
            { id: "w3", from: "g:out", to: "y:in0" },
        ];
        const outputs = [[false, false], [false, true], [true, false], [true, true]].map(
            ([a, b]) => simulateLogic(withSwitches(parts, { a, b }), wires).leds.y
        );
        expect(outputs).toEqual(expected);
    });

    it("inverts with NOT and treats unconnected inputs as 0", () => {
        const parts: LogicPart[] = [{ id: "n", kind: "not" }, { id: "y", kind: "led" }];
        expect(simulateLogic(parts, [{ id: "w", from: "n:out", to: "y:in0" }]).leds.y).toBe(true);
    });

    it("follows the clock level", () => {
        const parts: LogicPart[] = [{ id: "clk", kind: "clock", period: 1 }, { id: "y", kind: "led" }];
        const wires = [{ id: "w", from: "clk:out", to: "y:in0" }];
        expect(simulateLogic(parts, wires, { clk: true }).leds.y).toBe(true);
        expect(simulateLogic(parts, wires, { clk: false }).leds.y).toBe(false);
    });

    it("remembers a bit in the SR latch", () => {
        const { parts, wires } = example("sr-latch");
        let result = simulateLogic(withSwitches(parts, { s: true }), wires);
        result = simulateLogic(withSwitches(parts, {}), wires, {}, result);
        result = simulateLogic(withSwitches(parts, {}), wires, {}, result);
        expect(result.leds.q).toBe(true);
        expect(result.leds.qn).toBe(false);

        result = simulateLogic(withSwitches(parts, { r: true }), wires, {}, result);
        result = simulateLogic(withSwitches(parts, {}), wires, {}, result);
        expect(result.leds.q).toBe(false);
        expect(result.leds.qn).toBe(true);
    });

    it("reports an oscillating loop as unstable", () => {
        const parts: LogicPart[] = [{ id: "n", kind: "not" }];
        expect(simulateLogic(parts, [{ id: "w", from: "n:out", to: "n:in0" }]).stable).toBe(false);
    });

    it("colours wires by the value they carry", () => {
        const { parts, wires } = example("and");
        const result = simulateLogic(withSwitches(parts, { a: true }), wires);
        expect(result.wires).toEqual({ w1: true, w2: false, w3: false });
    });
});

describe("truthTable", () => {
    it("tabulates the full adder", () => {
        const { parts, wires } = example("full-adder");
        const table = truthTable(parts, wires);
        if ("reason" in table) throw new Error(table.reason);
        expect(table.inputs).toEqual(["A", "B", "Cin"]);
        expect(table.outputs).toEqual(["Sum", "Cout"]);
        for (const row of table.rows) {
            const total = row.inputs.filter(Boolean).length;
            expect(row.outputs).toEqual([total % 2 === 1, total >= 2]);
        }
    });

    it("explains why there's no table for latches and clocks", () => {
        const latch = example("sr-latch");
        expect(hasFeedback(latch.parts, latch.wires)).toBe(true);
        expect(truthTable(latch.parts, latch.wires)).toMatchObject({ reason: expect.stringMatching(/feedback/) });
        const blinker = example("blinker");
        expect(truthTable(blinker.parts, blinker.wires)).toMatchObject({ reason: expect.stringMatching(/clock/) });
    });
});

describe("parseLogicDocument", () => {
    it("accepts every example", () => {
        for (const { circuit } of LOGIC_EXAMPLES) {
            expect(parseLogicDocument(JSON.parse(JSON.stringify(circuit))).wires).toHaveLength(circuit.wires.length);
        }
    });

    it("rejects files that aren't logic circuits", () => {
        expect(() => parseLogicDocument([])).toThrow();
        expect(() => parseLogicDocument({ parts: [{ id: "x", kind: "resistor" }], wires: [] })).toThrow(/unknown type/);
    });

    it("drops invalid wires and clamps clock periods", () => {
        const doc = parseLogicDocument({
            parts: [
                { id: "a", kind: "switch" },
                { id: "clk", kind: "clock", period: 99 },
                { id: "y", kind: "led" },
            ],
            wires: [
                { id: "ok", from: "a:out", to: "y:in0" },
                { id: "second-driver", from: "clk:out", to: "y:in0" },
                { id: "from-input", from: "y:in0", to: "a:out" },
                { id: "dangling", from: "zzz:out", to: "y:in0" },
            ],
        });
        expect(doc.wires.map((wire) => wire.id)).toEqual(["ok"]);
        expect(doc.parts[1].period).toBe(10);
    });
});
