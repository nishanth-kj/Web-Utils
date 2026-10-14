import { describe, expect, it } from "vitest";
import type { AnalogPart, Wire } from "@/lib/circuit/analog/parts";
import { initialSimState, solveCircuit, solveLinear } from "@/lib/circuit/analog/solver";
import { formatSI, parseSI } from "@/lib/circuit/units";

const wire = (id: string, from: string, to: string): Wire => ({ id, from, to });
const solve = (parts: AnalogPart[], wires: Wire[]) => solveCircuit(parts, wires, initialSimState(), 1e-3);

const battery = (value = 9): AnalogPart => ({ id: "bat", kind: "battery", value });

describe("solveLinear", () => {
    it("solves a small system", () => {
        expect(solveLinear([[2, 1], [1, 3]], [3, 5]).map((x) => Number(x.toFixed(6)))).toEqual([0.8, 1.4]);
    });
});

describe("solveCircuit", () => {
    it("applies Ohm's law to a single resistor", () => {
        const result = solve(
            [battery(), { id: "r", kind: "resistor", value: 1000 }],
            [wire("w1", "bat:a", "r:a"), wire("w2", "r:b", "bat:b")]
        );
        expect(result.readings.r.current).toBeCloseTo(0.009, 5);
        expect(result.readings.r.voltage).toBeCloseTo(9, 3);
        expect(result.readings.bat.current).toBeCloseTo(0.009, 5);
        expect(result.wireCurrents.w1).toBeCloseTo(0.009, 5);
        expect(result.wireCurrents.w2).toBeCloseTo(0.009, 5);
        expect(result.shortCircuit).toBe(false);
    });

    it("splits voltage across a divider and reports it against ground", () => {
        const result = solve(
            [battery(), { id: "r1", kind: "resistor", value: 10_000 }, { id: "r2", kind: "resistor", value: 10_000 }, { id: "gnd", kind: "ground", value: 0 }],
            [wire("w1", "bat:a", "r1:a"), wire("w2", "r1:b", "r2:a"), wire("w3", "r2:b", "bat:b"), wire("w4", "bat:b", "gnd:a")]
        );
        expect(result.terminalVoltages["r2:a"]).toBeCloseTo(4.5, 3);
        expect(result.readings.r2.voltage).toBeCloseTo(4.5, 3);
    });

    it("shares current between parallel bulbs", () => {
        const result = solve(
            [battery(), { id: "b1", kind: "bulb", value: 100 }, { id: "b2", kind: "bulb", value: 100 }],
            [wire("w1", "bat:a", "b1:a"), wire("w2", "bat:a", "b2:a"), wire("w3", "b1:b", "bat:b"), wire("w4", "b2:b", "bat:b")]
        );
        expect(result.readings.b1.current).toBeCloseTo(0.09, 3);
        expect(result.readings.b2.current).toBeCloseTo(0.09, 3);
        expect(result.readings.bat.current).toBeCloseTo(0.18, 3);
    });

    it("drops the forward voltage across a lit LED", () => {
        const result = solve(
            [battery(), { id: "r", kind: "resistor", value: 330 }, { id: "led", kind: "led", value: 0, color: "red" }],
            [wire("w1", "bat:a", "r:a"), wire("w2", "r:b", "led:a"), wire("w3", "led:b", "bat:b")]
        );
        expect(result.readings.led.on).toBe(true);
        expect(result.readings.led.current).toBeCloseTo((9 - 1.8) / 340, 4);
        expect(result.overloadedLeds).toEqual([]);
    });

    it("blocks current through a reversed LED", () => {
        const result = solve(
            [battery(), { id: "r", kind: "resistor", value: 330 }, { id: "led", kind: "led", value: 0 }],
            [wire("w1", "bat:a", "r:a"), wire("w2", "r:b", "led:b"), wire("w3", "led:a", "bat:b")]
        );
        expect(result.readings.led.on).toBe(false);
        expect(Math.abs(result.readings.r.current)).toBeLessThan(1e-6);
    });

    it("flags an LED driven without a current-limiting resistor", () => {
        const result = solve([battery(), { id: "led", kind: "led", value: 0 }], [wire("w1", "bat:a", "led:a"), wire("w2", "led:b", "bat:b")]);
        expect(result.overloadedLeds).toEqual(["led"]);
    });

    it("stops current at an open switch", () => {
        const result = solve(
            [battery(), { id: "sw", kind: "switch", value: 0, closed: false }, { id: "b", kind: "bulb", value: 100 }],
            [wire("w1", "bat:a", "sw:a"), wire("w2", "sw:b", "b:a"), wire("w3", "b:b", "bat:b")]
        );
        expect(Math.abs(result.readings.b.current)).toBeLessThan(1e-6);
        expect(result.readings.sw.voltage).toBeCloseTo(9, 3);
    });

    it("detects a short circuit", () => {
        const result = solve([battery()], [wire("w1", "bat:a", "bat:b")]);
        expect(result.shortCircuit).toBe(true);
    });

    it("charges a capacitor along the RC curve", () => {
        const parts: AnalogPart[] = [battery(10), { id: "r", kind: "resistor", value: 1000 }, { id: "c", kind: "capacitor", value: 1e-3 }];
        const wires = [wire("w1", "bat:a", "r:a"), wire("w2", "r:b", "c:a"), wire("w3", "c:b", "bat:b")];
        let state = initialSimState();
        let result = solveCircuit(parts, wires, state, 1e-3);
        // One time constant (RC = 1 s) in 1 ms steps: 1 − e⁻¹ ≈ 63.2 %.
        for (let step = 0; step < 1000; step++) {
            result = solveCircuit(parts, wires, state, 1e-3);
            state = result.state;
        }
        expect(result.readings.c.voltage / 10).toBeCloseTo(1 - Math.exp(-1), 2);
    });

    it("leaves unconnected parts at zero without NaNs", () => {
        const result = solve([battery(), { id: "r", kind: "resistor", value: 100 }], []);
        expect(result.readings.r.current).toBe(0);
        expect(Object.values(result.terminalVoltages).every(Number.isFinite)).toBe(true);
    });
});

describe("formatSI / parseSI", () => {
    it.each([
        [0.0213, "A", "21.3 mA"],
        [4700, "Ω", "4.7 kΩ"],
        [1e-4, "F", "100 µF"],
        [9, "V", "9 V"],
        [0, "A", "0 A"],
    ])("formats %s %s as %s", (value, unit, text) => {
        expect(formatSI(value, unit)).toBe(text);
    });

    it.each([
        ["4700", 4700],
        ["4.7k", 4700],
        ["4k7", 4700],
        ["100u", 1e-4],
        ["100µF", 1e-4],
        ["2.2 MΩ", 2.2e6],
        ["2.2m", 2.2e-3],
        ["9V", 9],
    ])("parses %s", (text, value) => {
        expect(parseSI(text)).toBeCloseTo(value, 12);
    });

    it("rejects garbage", () => {
        expect(parseSI("abc")).toBeNull();
        expect(parseSI("")).toBeNull();
    });
});

describe("circuit documents", () => {
    it("loads every example and solves it without problems", async () => {
        const { ANALOG_EXAMPLES, parseCircuitDocument } = await import("@/lib/circuit/analog/document");
        for (const example of ANALOG_EXAMPLES) {
            const doc = parseCircuitDocument(JSON.parse(JSON.stringify(example.circuit)));
            expect(doc.wires).toHaveLength(example.circuit.wires.length);
            const result = solve(doc.parts, doc.wires);
            expect(result.shortCircuit, example.id).toBe(false);
            expect(result.overloadedLeds, example.id).toEqual([]);
        }
    });

    it("gives the LED example about 21 mA", async () => {
        const { ANALOG_EXAMPLES } = await import("@/lib/circuit/analog/document");
        const { parts, wires } = ANALOG_EXAMPLES.find((e) => e.id === "led")!.circuit;
        expect(solve(parts, wires).readings.led1.current).toBeCloseTo(0.0212, 3);
    });

    it("rejects files that aren't circuits", async () => {
        const { parseCircuitDocument } = await import("@/lib/circuit/analog/document");
        expect(() => parseCircuitDocument(null)).toThrow();
        expect(() => parseCircuitDocument({ parts: "x", wires: [] })).toThrow(/missing parts or wires/);
        expect(() => parseCircuitDocument({ parts: [{ id: "a", kind: "flux-capacitor" }], wires: [] })).toThrow(/unknown type/);
        expect(() => parseCircuitDocument({ parts: [{ id: "a", kind: "resistor" }, { id: "a", kind: "resistor" }], wires: [] })).toThrow(/duplicate/);
    });

    it("clamps values, defaults bad fields and drops dangling wires", async () => {
        const { parseCircuitDocument } = await import("@/lib/circuit/analog/document");
        const doc = parseCircuitDocument({
            parts: [
                { id: "r", kind: "resistor", value: -5, x: "oops", rotation: 45 },
                { id: "led", kind: "led", color: "ultraviolet" },
            ],
            wires: [{ id: "ok", from: "r:b", to: "led:a" }, { id: "bad", from: "r:a", to: "missing:a" }],
        });
        expect(doc.parts[0]).toMatchObject({ value: 0.001, x: 0, rotation: 0 });
        expect(doc.parts[1].color).toBe("red");
        expect(doc.wires.map((w) => w.id)).toEqual(["ok"]);
    });
});

describe("open circuits", () => {
    it("reports exactly zero current through a battery with an open switch", () => {
        const result = solve(
            [battery(), { id: "sw", kind: "switch", value: 0, closed: false }, { id: "b", kind: "bulb", value: 100 }],
            [wire("w1", "bat:a", "sw:a"), wire("w2", "sw:b", "b:a"), wire("w3", "b:b", "bat:b")]
        );
        expect(result.readings.bat.current).toBe(0);
        expect(result.wireCurrents.w1).toBe(0);
    });
});
