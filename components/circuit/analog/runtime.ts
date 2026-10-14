import { createContext } from "react";
import type { AnalogKind, LedColor, Rotation } from "@/lib/circuit/analog/parts";
import type { SolveResult } from "@/lib/circuit/analog/solver";

export interface PartNodeData {
    kind: AnalogKind;
    value: number;
    rotation: Rotation;
    closed?: boolean;
    color?: LedColor;
}

// Live simulation results are shared through context rather than node data,
// so a new reading every animation frame doesn't rebuild React Flow's nodes.
export interface AnalogRuntime {
    result: SolveResult;
    toggleSwitch: (id: string) => void;
}

export const AnalogRuntimeContext = createContext<AnalogRuntime | null>(null);
