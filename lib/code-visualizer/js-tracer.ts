import type { ExecutionStep, HeapObject, StackFrame, TraceResult, TraceValue } from "./types";

// Both js-interpreter and @babel/standalone ship as UMD/CJS bundles with no real ESM
// entry point, so their shape after a bundler's dynamic import varies between
// `module` and `module.default` depending on interop settings — check both.
type BabelLike = { transform: (code: string, opts: Record<string, unknown>) => { code: string } };
type InterpreterCtor = new (code: string, initFunc?: (interpreter: PseudoInterpreter, globalObject: PseudoObject) => void) => PseudoInterpreter;

// js-interpreter's own pseudo-object model: every non-primitive value (object, array,
// function) is one of these, never a native JS object/array.
interface PseudoObject {
    class?: string;
    properties: Record<string, unknown>;
    proto?: PseudoObject | null;
    parentScope?: PseudoScope;
    node?: { id?: { name?: string } };
}
interface PseudoScope {
    object: PseudoObject;
    parentScope: PseudoScope | null;
}
interface PseudoState {
    node?: {
        type: string;
        loc?: { start: { line: number } };
        callee?: { type: string; name?: string; computed?: boolean; property?: { name?: string } };
    };
    scope?: PseudoScope;
    func_?: PseudoObject;
    done?: boolean;
}
interface PseudoInterpreter {
    step(): boolean;
    stateStack: PseudoState[];
    setProperty(obj: PseudoObject, name: string, value: unknown): void;
    nativeToPseudo(value: unknown): PseudoObject;
    pseudoToNative(value: unknown): unknown;
    createNativeFunction(fn: (...args: unknown[]) => unknown): PseudoObject;
    UNDEFINED: unknown;
}

const STATEMENT_TYPES = new Set([
    "VariableDeclaration",
    "ExpressionStatement",
    "ReturnStatement",
    "IfStatement",
    "ForStatement",
    "ForInStatement",
    "WhileStatement",
    "DoWhileStatement",
    "BreakStatement",
    "ContinueStatement",
    "ThrowStatement",
    "TryStatement",
    "SwitchStatement",
]);

const IGNORED_GLOBALS = new Set(["window", "self", "console"]);

const MAX_MICRO_STEPS = 300_000;
const MAX_CAPTURED_STEPS = 2000;

const BABEL_PLUGINS = [
    "transform-block-scoping",
    "transform-arrow-functions",
    "transform-template-literals",
    "transform-destructuring",
    "transform-for-of",
    "transform-parameters",
    "transform-spread",
    "transform-shorthand-properties",
    "transform-computed-properties",
    "transform-exponentiation-operator",
];

async function loadBabel(): Promise<BabelLike> {
    const mod = (await import("@babel/standalone")) as unknown as { transform?: BabelLike["transform"]; default?: BabelLike };
    return mod.transform ? (mod as BabelLike) : mod.default!;
}

async function loadInterpreter(): Promise<InterpreterCtor> {
    const mod = (await import("js-interpreter")) as unknown as { default?: InterpreterCtor } & InterpreterCtor;
    return (mod.default ?? mod) as InterpreterCtor;
}

/**
 * Downlevels modern JS (let/const, arrows, template literals, destructuring, for-of,
 * default/rest params, spread, shorthand props) to the ES5 subset js-interpreter can
 * run, keeping line numbers aligned via `retainLines` so traced steps still point at
 * the line the user actually wrote. Anything js-interpreter still can't parse after
 * this (classes, generators, async/await, optional chaining, ...) surfaces as a plain
 * parse error naming the offending line.
 */
async function transpile(code: string): Promise<string> {
    const Babel = await loadBabel();
    const result = Babel.transform(code, {
        plugins: BABEL_PLUGINS,
        retainLines: true,
        compact: false,
        sourceMaps: false,
        parserOpts: { sourceType: "script" },
    });
    return result.code;
}

function describeCallee(node: NonNullable<PseudoState["node"]>["callee"], func: PseudoObject | undefined): string {
    if (node?.type === "Identifier" && node.name) return node.name;
    if (node?.type === "MemberExpression" && !node.computed && node.property?.name) return node.property.name;
    if (func?.node?.id?.name) return func.node.id.name;
    return "(anonymous)";
}

function collectCallNames(stack: PseudoState[]): string[] {
    const names: string[] = [];
    for (const state of stack) {
        if ((state.node?.type === "CallExpression" || state.node?.type === "NewExpression") && state.func_) {
            const prefix = state.node.type === "NewExpression" ? "new " : "";
            names.push(prefix + describeCallee(state.node.callee, state.func_));
        }
    }
    return names;
}

/**
 * Scans the interpreter's real execution stack for the distinct scopes currently
 * active, outermost (global) first. This is deliberately NOT `scope.parentScope`
 * walked from the top state — that chain is JS's *lexical* scope (where a function
 * was defined), which for a recursive function is always just [that function,
 * global] no matter how deep the recursion actually is. Scanning the state stack
 * instead follows the *dynamic* call stack, so each pending recursive call gets
 * its own frame.
 */
function collectActiveScopes(stack: PseudoState[]): PseudoScope[] {
    const scopes: PseudoScope[] = [];
    let last: PseudoScope | undefined;
    for (const state of stack) {
        if (state.scope && state.scope !== last) {
            scopes.push(state.scope);
            last = state.scope;
        }
    }
    return scopes;
}

function isPseudoObject(value: unknown): value is PseudoObject {
    return typeof value === "object" && value !== null && "properties" in value && "class" in value;
}

function classifyKind(pseudoClass: string | undefined): HeapObject["kind"] {
    if (pseudoClass === "Array") return "list";
    if (pseudoClass === "Function") return "function";
    return "object";
}

function describeValue(
    raw: unknown,
    heap: Record<string, HeapObject>,
    idMap: Map<PseudoObject, string>,
    nextId: { n: number },
): TraceValue {
    if (raw === undefined) return { kind: "primitive", display: "undefined", type: "undefined" };
    if (raw === null) return { kind: "primitive", display: "null", type: "null" };
    if (isPseudoObject(raw)) {
        let id = idMap.get(raw);
        if (!id) {
            id = `js_${nextId.n++}`;
            idMap.set(raw, id);
            const kind = classifyKind(raw.class);
            const label = kind === "function" ? `function ${raw.node?.id?.name ?? "(anonymous)"}` : raw.class ?? "Object";
            const entries: HeapObject["entries"] = [];
            heap[id] = { id, kind, label, entries };
            const keys = Object.keys(raw.properties);
            for (const key of keys) {
                entries.push({ key, value: describeValue(raw.properties[key], heap, idMap, nextId) });
            }
        }
        return { kind: "ref", objectId: id };
    }
    const type = typeof raw;
    if (type === "string") return { kind: "primitive", display: JSON.stringify(raw), type };
    return { kind: "primitive", display: String(raw), type };
}

function buildFrames(
    stack: PseudoState[],
    callNames: string[],
    heap: Record<string, HeapObject>,
    idMap: Map<PseudoObject, string>,
    nextId: { n: number },
    sourceIdentifiers: Set<string>,
): StackFrame[] {
    const scopes = collectActiveScopes(stack);
    const namesNeeded = scopes.length - 1;
    const names = callNames.slice(Math.max(0, callNames.length - namesNeeded));

    return scopes.map((scope, i) => {
        const variables: StackFrame["variables"] = [];
        for (const [name, value] of Object.entries(scope.object.properties)) {
            if (IGNORED_GLOBALS.has(name)) continue;
            // Downleveling let/const/for-of/etc. to ES5 introduces Babel-generated helper
            // bindings (`_i`, `_arr`, a renamed `_n` to dodge a scope collision, ...) that
            // never existed in what the user typed, and every ES5 function call gets an
            // implicit `arguments`/`this` binding whether the body uses them or not — hide
            // all of these unless the user's own source actually names them.
            const isImplicitBinding = name.startsWith("_") || name === "arguments" || name === "this";
            if (isImplicitBinding && !sourceIdentifiers.has(name)) continue;
            variables.push({ name, value: describeValue(value, heap, idMap, nextId) });
        }
        return {
            id: `frame_${i}`,
            name: i === 0 ? "global" : names[i - 1] ?? "(anonymous)",
            variables,
        };
    });
}

function extractIdentifiers(source: string): Set<string> {
    const matches = source.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) ?? [];
    return new Set(matches);
}

/** Traces JS execution one statement at a time, producing a step per line executed. */
export async function traceJavaScript(code: string): Promise<TraceResult> {
    let transpiled: string;
    try {
        transpiled = await transpile(code);
    } catch (err) {
        return { steps: [], error: err instanceof Error ? err.message : "Failed to parse JavaScript." };
    }

    const Interpreter = await loadInterpreter();

    let stdout = "";
    const initFunc = (interpreter: PseudoInterpreter, globalObject: PseudoObject) => {
        const consoleObj = interpreter.nativeToPseudo({});
        interpreter.setProperty(globalObject, "console", consoleObj);
        for (const method of ["log", "info", "warn", "error"]) {
            interpreter.setProperty(
                consoleObj,
                method,
                interpreter.createNativeFunction((...args: unknown[]) => {
                    const parts = args.map((a) => interpreter.pseudoToNative(a));
                    stdout += parts.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(" ") + "\n";
                    return interpreter.UNDEFINED;
                }),
            );
        }
    };

    let interpreter: PseudoInterpreter;
    try {
        interpreter = new Interpreter(transpiled, initFunc);
    } catch (err) {
        return { steps: [], error: err instanceof Error ? err.message : "Failed to parse JavaScript." };
    }

    const steps: ExecutionStep[] = [];
    const seen = new WeakSet<PseudoState>();
    const idMap = new Map<PseudoObject, string>();
    const nextId = { n: 0 };
    const sourceIdentifiers = extractIdentifiers(code);
    let error: string | null = null;
    let microSteps = 0;

    try {
        let more = true;
        while (more && microSteps < MAX_MICRO_STEPS && steps.length < MAX_CAPTURED_STEPS) {
            more = interpreter.step();
            microSteps++;
            const stack = interpreter.stateStack;
            const top = stack[stack.length - 1];
            if (!top?.node || !STATEMENT_TYPES.has(top.node.type) || seen.has(top)) continue;
            seen.add(top);
            const line = top.node.loc?.start.line ?? 1;

            const heap: Record<string, HeapObject> = {};
            const callNames = collectCallNames(stack);
            const frames = buildFrames(stack, callNames, heap, idMap, nextId, sourceIdentifiers);

            steps.push({ line, event: "line", frames, heap, stdout });
        }
        if (microSteps >= MAX_MICRO_STEPS || steps.length >= MAX_CAPTURED_STEPS) {
            error = "Stopped early — this program runs too long to visualize in full (possible infinite loop).";
        }
    } catch (err) {
        error = err instanceof Error ? err.message : "The program threw an error while running.";
    }

    return { steps, error };
}
