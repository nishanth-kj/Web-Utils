import type { TraceResult } from "./types";

// Self-hosting Pyodide's ~200MB full distribution in public/ isn't practical, so unlike
// sql.js's locally-hosted wasm this loads from Pyodide's own CDN — it serves with
// `access-control-allow-origin: *` (verified), so it doesn't hit the CORS pitfalls
// Monaco's CDN copy did for html-to-image export.
const PYODIDE_VERSION = "314.0.7";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PyodideInterface {
    runPython(code: string): unknown;
    globals: { set(name: string, value: unknown): void };
}

declare global {
    interface Window {
        loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
    }
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const el = document.createElement("script");
        el.src = src;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error("Failed to load the Python runtime."));
        document.head.appendChild(el);
    });
}

async function getPyodide(): Promise<PyodideInterface> {
    if (!pyodidePromise) {
        pyodidePromise = (async () => {
            if (!window.loadPyodide) await loadScript(`${PYODIDE_INDEX_URL}pyodide.js`);
            if (!window.loadPyodide) throw new Error("Failed to load the Python runtime.");
            return window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
        })();
    }
    return pyodidePromise;
}

// Runs the user's code under sys.settrace, capturing one JSON-serializable step per
// line/call/return event: the executing line, the full call stack's locals, and every
// container object reachable from them (id()-keyed, so the same object keeps the same
// id across steps — mirroring the ExecutionStep/HeapObject shape in ./types.ts exactly
// so the UI doesn't need per-language branching). Ends with a json.dumps() so the only
// thing crossing the JS/Python boundary is one plain string.
const HARNESS = `
import sys, json, io

_MAX_STEPS = 2000
_trace_steps = []
_heap = {}
_stdout_buf = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _stdout_buf

def _describe(val):
    if isinstance(val, bool):
        return {"kind": "primitive", "display": "True" if val else "False", "type": "bool"}
    if val is None:
        return {"kind": "primitive", "display": "None", "type": "NoneType"}
    if isinstance(val, (int, float)):
        return {"kind": "primitive", "display": repr(val), "type": type(val).__name__}
    if isinstance(val, str):
        return {"kind": "primitive", "display": repr(val), "type": "str"}

    key = "py_" + str(id(val))
    if key in _heap:
        return {"kind": "ref", "objectId": key}

    if isinstance(val, list):
        kind, label = "list", "list"
    elif isinstance(val, tuple):
        kind, label = "tuple", "tuple"
    elif isinstance(val, dict):
        kind, label = "dict", "dict"
    elif isinstance(val, (set, frozenset)):
        kind, label = "set", "set"
    elif isinstance(val, type):
        kind, label = "function", "class " + getattr(val, "__name__", "?")
        _heap[key] = {"id": key, "kind": kind, "label": label, "entries": []}
        return {"kind": "ref", "objectId": key}
    elif callable(val):
        kind, label = "function", "function " + getattr(val, "__name__", "?")
        _heap[key] = {"id": key, "kind": kind, "label": label, "entries": []}
        return {"kind": "ref", "objectId": key}
    else:
        kind, label = "object", type(val).__name__

    _heap[key] = {"id": key, "kind": kind, "label": label, "entries": []}  # placeholder breaks self-reference cycles
    entries = []
    try:
        if isinstance(val, dict):
            for k, v in val.items():
                entries.append({"key": str(k), "value": _describe(v)})
        elif isinstance(val, (list, tuple, set, frozenset)):
            for i, v in enumerate(val):
                entries.append({"key": str(i), "value": _describe(v)})
        elif hasattr(val, "__dict__"):
            for k, v in vars(val).items():
                if not k.startswith("__"):
                    entries.append({"key": k, "value": _describe(v)})
    except Exception:
        pass
    _heap[key]["entries"] = entries
    return {"kind": "ref", "objectId": key}

def _snapshot_frames(frame):
    chain = []
    f = frame
    while f is not None and f.f_code.co_filename == "<user>":
        chain.append(f)
        f = f.f_back
    chain.reverse()
    frames = []
    for i, fr in enumerate(chain):
        variables = []
        for name, val in fr.f_locals.items():
            if name.startswith("__"):
                continue
            try:
                variables.append({"name": name, "value": _describe(val)})
            except Exception:
                variables.append({"name": name, "value": {"kind": "primitive", "display": "<unrepresentable>", "type": "?"}})
        frames.append({"id": "frame_" + str(i), "name": "global" if i == 0 else fr.f_code.co_name, "variables": variables})
    return frames

def _tracer(frame, event, arg):
    if frame.f_code.co_filename != "<user>":
        return _tracer
    if event not in ("line", "call", "return"):
        return _tracer
    global _heap
    _heap = {}
    frames = _snapshot_frames(frame)
    if event == "call" and len(frames) <= 1:
        return _tracer  # the synthetic "entering the module" call carries no useful state
    if len(_trace_steps) >= _MAX_STEPS:
        raise RuntimeError("__STEP_LIMIT__")
    _trace_steps.append({
        "line": frame.f_lineno,
        "event": event,
        "frames": frames,
        "heap": _heap,
        "stdout": _stdout_buf.getvalue(),
    })
    return _tracer

_error = None
try:
    sys.settrace(_tracer)
    exec(compile(__user_code__, "<user>", "exec"), {"__name__": "__main__"})
except RuntimeError as e:
    _error = "Stopped early — this program runs too long to visualize in full (possible infinite loop)." if str(e) == "__STEP_LIMIT__" else str(e)
except Exception as e:
    _error = type(e).__name__ + ": " + str(e)
finally:
    sys.settrace(None)
    sys.stdout = _old_stdout

json.dumps({"steps": _trace_steps, "error": _error})
`;

export async function tracePython(code: string): Promise<TraceResult> {
    try {
        const pyodide = await getPyodide();
        pyodide.globals.set("__user_code__", code);
        const resultJson = pyodide.runPython(HARNESS) as string;
        return JSON.parse(resultJson) as TraceResult;
    } catch (err) {
        return { steps: [], error: err instanceof Error ? err.message : "Failed to run Python." };
    }
}
