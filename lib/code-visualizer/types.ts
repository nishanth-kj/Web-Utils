export type VisualizerLanguage = "javascript" | "python";

/** A primitive is rendered inline inside whatever frame/object row holds it. */
export type PrimitiveValue = {
    kind: "primitive";
    // Pre-formatted display text (e.g. `"hello"`, `42`, `true`, `None`) so renderers
    // don't need per-language formatting rules for strings vs numbers vs null.
    display: string;
    type: string;
};

/** A reference points at a HeapObject, drawn as a separate box with an arrow to it. */
export type RefValue = {
    kind: "ref";
    objectId: string;
};

export type TraceValue = PrimitiveValue | RefValue;

export type HeapObjectKind = "list" | "dict" | "object" | "function" | "set" | "tuple";

export interface HeapObject {
    id: string;
    kind: HeapObjectKind;
    /** Class/constructor/type name shown in the box header, e.g. "list", "Point", "function add". */
    label: string;
    /** Ordered key/value rows — list index, dict key, or object attribute name. */
    entries: { key: string; value: TraceValue }[];
}

export interface StackFrame {
    id: string;
    /** "global" for the module-level frame, otherwise the function name. */
    name: string;
    /** Ordered so parameters appear before locals declared later. */
    variables: { name: string; value: TraceValue }[];
}

export interface ExecutionStep {
    /** 1-indexed source line about to execute (or just executed, for a return/exception step). */
    line: number;
    event: "line" | "call" | "return" | "exception";
    /** Outermost (global) frame first, innermost (most recently called) frame last. */
    frames: StackFrame[];
    /** Every heap object reachable from any frame at this point in execution. */
    heap: Record<string, HeapObject>;
    /** Cumulative stdout produced by the program up to and including this step. */
    stdout: string;
}

export interface TraceResult {
    steps: ExecutionStep[];
    /** Set when execution stopped early — a thrown error, syntax error, or the step ceiling. */
    error: string | null;
}
