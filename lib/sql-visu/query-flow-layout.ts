import type { QueryStage } from "./types";

export const STAGE_NODE_WIDTH = 260;
const LINE_HEIGHT = 18;
const HEADER_HEIGHT = 34;
const LAYER_GAP_Y = 90;
const NODE_GAP_X = 40;

export interface QueryStagePosition {
    stage: QueryStage;
    x: number;
    y: number;
    width: number;
    height: number;
}

function stageHeight(stage: QueryStage): number {
    return HEADER_HEIGHT + Math.max(stage.lines.length, 1) * LINE_HEIGHT + 16;
}

/** Lays the pipeline out top-to-bottom: a stage sits one layer below the deepest stage that feeds it. */
export function layoutQueryFlow(stages: QueryStage[]): QueryStagePosition[] {
    const byId = new Map(stages.map((s) => [s.id, s]));
    const layerCache = new Map<string, number>();

    function computeLayer(id: string, visiting: Set<string>): number {
        if (layerCache.has(id)) return layerCache.get(id)!;
        if (visiting.has(id)) return 0;
        const stage = byId.get(id);
        if (!stage || stage.inputs.length === 0) {
            layerCache.set(id, 0);
            return 0;
        }
        visiting.add(id);
        let maxInputLayer = -1;
        for (const inputId of stage.inputs) {
            if (!byId.has(inputId)) continue;
            maxInputLayer = Math.max(maxInputLayer, computeLayer(inputId, visiting));
        }
        visiting.delete(id);
        const layer = maxInputLayer + 1;
        layerCache.set(id, layer);
        return layer;
    }

    const layers = new Map<number, QueryStage[]>();
    for (const stage of stages) {
        const layer = computeLayer(stage.id, new Set());
        if (!layers.has(layer)) layers.set(layer, []);
        layers.get(layer)!.push(stage);
    }

    const positions: QueryStagePosition[] = [];
    for (const layerIndex of Array.from(layers.keys()).sort((a, b) => a - b)) {
        const layerStages = layers.get(layerIndex)!;
        const y = layerIndex * (LAYER_GAP_Y + 60);
        let x = 0;
        for (const stage of layerStages) {
            const height = stageHeight(stage);
            positions.push({ stage, x, y, width: STAGE_NODE_WIDTH, height });
            x += STAGE_NODE_WIDTH + NODE_GAP_X;
        }
    }

    return positions;
}
