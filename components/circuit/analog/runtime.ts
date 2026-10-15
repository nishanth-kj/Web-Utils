import { createContext } from "react";
import type { AnalogKind, LedColor, Rotation } from "@/lib/circuit/analog/parts";
import type { ScopeBuffer } from "@/lib/circuit/analog/scope";
import type { SolveResult } from "@/lib/circuit/analog/solver";

export interface PartNodeData {
    kind: AnalogKind;
    value: number;
    rotation: Rotation;
    closed?: boolean;
    color?: LedColor;
    position?: number;
    frequency?: number;
    /** Oscilloscope seconds per division. */
    timePerDiv?: number;
    /** Oscilloscope volts per division; unset means automatic. */
    voltsPerDiv?: number;
}

// Live simulation results are shared through context rather than node data,
// so a new reading every animation frame doesn't rebuild React Flow's nodes.
export interface AnalogRuntime {
    result: SolveResult;
    toggleSwitch: (id: string) => void;
    updatePart: (id: string, patch: Partial<PartNodeData>) => void;
    /** Sample history per oscilloscope. */
    scopes: ReadonlyMap<string, ScopeBuffer>;
}

export const AnalogRuntimeContext = createContext<AnalogRuntime | null>(null);
