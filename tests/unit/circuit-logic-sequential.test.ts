import { describe, expect, it } from "vitest";
import {
    LOGIC_EXAMPLES,
    POWERED_OFF,
    parseLogicDocument,
    simulateLogic,
    truthTable,
    type LogicPart,
    type LogicResult,
    type LogicWire,
} from "@/lib/circuit/logic/logic";

const example = (id: string) => LOGIC_EXAMPLES.find((e) => e.id === id)!.circuit;
const set = (parts: LogicPart[], values: Record<string, boolean>) => parts.map((p) => (p.id in values ? { ...p, on: values[p.id] } : p));

describe("D flip-flop", () => {
    const { parts, wires } = example("d-flip-flop");
    const step = (previous: LogicResult, d: boolean, clk: boolean) => simulateLogic(set(parts, { d, clk }), wires, {}, previous);

    it("copies D only on a rising clock edge", () => {
        let r = step(POWERED_OFF, true, false);
        expect(r.leds.q).toBe(false); // no edge yet
        r = step(r, true, true);
        expect(r.leds.q).toBe(true); // rising edge: Q = D
        expect(r.leds.qn).toBe(false);
        r = step(r, false, true);
        expect(r.leds.q).toBe(true); // D changes while CLK stays high: ignored
        r = step(r, false, false);
        expect(r.leds.q).toBe(true); // falling edge: ignored
        r = step(r, false, true);
        expect(r.leds.q).toBe(false); // next rising edge
    });
});

describe("T and JK flip-flops", () => {
    const parts = (kind: "tff" | "jkff"): LogicPart[] => [
        { id: "a", kind: "switch" },
        { id: "b", kind: "switch" },
        { id: "clk", kind: "switch" },
        { id: "ff", kind },
        { id: "q", kind: "led" },
    ];
    const wires = (kind: "tff" | "jkff"): LogicWire[] => [
        { id: "w1", from: "a:out", to: "ff:in0" },
        { id: "w2", from: "clk:out", to: "ff:in1" },
        ...(kind === "jkff" ? [{ id: "w3", from: "b:out", to: "ff:in2" }] : []),
        { id: "w4", from: "ff:out", to: "q:in0" },
    ];
    // Pulse the clock with inputs a/b, returning Q afterwards.
    const pulse = (kind: "tff" | "jkff", previous: LogicResult, a: boolean, b = false) => {
        const low = simulateLogic(set(parts(kind), { a, b, clk: false }), wires(kind), {}, previous);
        const high = simulateLogic(set(parts(kind), { a, b, clk: true }), wires(kind), {}, low);
        return simulateLogic(set(parts(kind), { a, b, clk: false }), wires(kind), {}, high);
    };

    it("toggles a T flip-flop only when T is 1", () => {
        let r = pulse("tff", POWERED_OFF, true);
        expect(r.leds.q).toBe(true);
        r = pulse("tff", r, true);
        expect(r.leds.q).toBe(false);
        r = pulse("tff", r, false);
        expect(r.leds.q).toBe(false);
    });

    it("sets, resets, holds and toggles a JK flip-flop", () => {
        let r = pulse("jkff", POWERED_OFF, true, false);
        expect(r.leds.q).toBe(true); // J: set
        r = pulse("jkff", r, false, false);
        expect(r.leds.q).toBe(true); // hold
        r = pulse("jkff", r, false, true);
        expect(r.leds.q).toBe(false); // K: reset
        r = pulse("jkff", r, true, true);
        expect(r.leds.q).toBe(true); // J and K: toggle
        r = pulse("jkff", r, true, true);
        expect(r.leds.q).toBe(false);
    });
});

describe("4-bit ripple counter", () => {
    it("counts clock pulses 0 to F on the 7-segment display and wraps", () => {
        const { parts, wires } = example("counter");
        let r = simulateLogic(parts, wires, { clk: false });
        expect(r.displays.disp).toBe(0);
        const counts: number[] = [];
        for (let pulse = 0; pulse < 17; pulse++) {
            r = simulateLogic(parts, wires, { clk: true }, r);
            counts.push(r.displays.disp);
            r = simulateLogic(parts, wires, { clk: false }, r);
        }
        expect(counts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1]);
    });

    it("holds the count while EN is off", () => {
        const { parts, wires } = example("counter");
        let r = simulateLogic(parts, wires, { clk: false });
        r = simulateLogic(parts, wires, { clk: true }, r);
        r = simulateLogic(parts, wires, { clk: false }, r);
        const held = parts.map((p) => (p.id === "en" ? { ...p, on: false } : p));
        r = simulateLogic(held, wires, { clk: true }, r);
        r = simulateLogic(held, wires, { clk: false }, r);
        r = simulateLogic(held, wires, { clk: true }, r);
        expect(r.displays.disp).toBe(1);
    });
});

describe("buffer, probe and 7-segment", () => {
    it("passes a value through a buffer to a logic probe", () => {
        const parts: LogicPart[] = [
            { id: "a", kind: "switch", on: true },
            { id: "buf", kind: "buffer" },
            { id: "p", kind: "probe" },
        ];
        const wires = [
            { id: "w1", from: "a:out", to: "buf:in0" },
            { id: "w2", from: "buf:out", to: "p:in0" },
        ];
        expect(simulateLogic(parts, wires).leds.p).toBe(true);
    });

    it("weights the display inputs 1, 2, 4 and 8", () => {
        const parts: LogicPart[] = [
            { id: "one", kind: "switch", on: true },
            { id: "eight", kind: "switch", on: true },
            { id: "disp", kind: "seg7" },
        ];
        const wires = [
            { id: "w1", from: "one:out", to: "disp:in0" },
            { id: "w2", from: "eight:out", to: "disp:in3" },
        ];
        expect(simulateLogic(parts, wires).displays.disp).toBe(9);
    });
});

describe("truth tables and files with the new parts", () => {
    it("explains why flip-flop circuits have no truth table", () => {
        const { parts, wires } = example("d-flip-flop");
        expect(truthTable(parts, wires)).toMatchObject({ reason: expect.stringMatching(/Flip-flops/) });
    });

    it("treats push buttons as truth table inputs", () => {
        const parts: LogicPart[] = [
            { id: "a", kind: "button", label: "A" },
            { id: "n", kind: "not" },
            { id: "y", kind: "probe", label: "Y" },
        ];
        const wires = [
            { id: "w1", from: "a:out", to: "n:in0" },
            { id: "w2", from: "n:out", to: "y:in0" },
        ];
        const table = truthTable(parts, wires);
        if ("reason" in table) throw new Error(table.reason);
        expect(table.rows.map((row) => row.outputs[0])).toEqual([true, false]);
    });

    it("accepts Q̄ wires only from flip-flops and inputs only on real pins", () => {
        const doc = parseLogicDocument({
            parts: [
                { id: "ff", kind: "jkff" },
                { id: "g", kind: "and" },
                { id: "d", kind: "seg7" },
            ],
            wires: [
                { id: "ok1", from: "ff:outn", to: "d:in3" },
                { id: "ok2", from: "g:out", to: "ff:in2" },
                { id: "bad1", from: "g:outn", to: "d:in0" },
                { id: "bad2", from: "ff:out", to: "g:in2" },
            ],
        });
        expect(doc.wires.map((w) => w.id)).toEqual(["ok1", "ok2"]);
    });

    it("loads the new examples", () => {
        for (const id of ["d-flip-flop", "counter"]) {
            const circuit = example(id);
            expect(parseLogicDocument(JSON.parse(JSON.stringify(circuit))).wires).toHaveLength(circuit.wires.length);
        }
    });
});
