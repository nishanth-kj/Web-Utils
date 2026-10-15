import { createContext } from "react";
import type { LogicKind, LogicResult } from "@/lib/circuit/logic/logic";

export interface LogicNodeData {
    kind: LogicKind;
    on?: boolean;
    period?: number;
    label?: string;
}

export interface LogicRuntime {
    result: LogicResult;
    toggleSwitch: (id: string) => void;
    /** Push buttons: held (true) or released. */
    setPressed: (id: string, pressed: boolean) => void;
}

// Signal values are shared through context so clock ticks don't rebuild
// React Flow's node list.
export const LogicRuntimeContext = createContext<LogicRuntime | null>(null);

export const HIGH_COLOR = "#10b981";
export const LOW_COLOR = "var(--muted-foreground)";
