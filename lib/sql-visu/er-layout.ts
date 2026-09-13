import type { ParsedTable } from "./types";

export const TABLE_NODE_WIDTH = 260;
const ROW_HEIGHT = 28;
const HEADER_HEIGHT = 40;
const LAYER_GAP_X = 120;
const NODE_GAP_Y = 48;

export interface ErNodePosition {
    table: ParsedTable;
    x: number;
    y: number;
    width: number;
    height: number;
}

function tableHeight(table: ParsedTable): number {
    return HEADER_HEIGHT + Math.max(table.columns.length, 1) * ROW_HEIGHT + 16;
}

/**
 * Places tables left-to-right by FK dependency depth (a table sits one layer to
 * the right of everything it references) so arrows generally point rightward
 * instead of crossing back over the diagram. Falls back to layer 0 for cycles.
 */
export function layoutErDiagram(tables: ParsedTable[]): ErNodePosition[] {
    const byName = new Map(tables.map((t) => [t.name, t]));
    const layerCache = new Map<string, number>();

    function computeLayer(tableName: string, visiting: Set<string>): number {
        if (layerCache.has(tableName)) return layerCache.get(tableName)!;
        if (visiting.has(tableName)) return 0; // circular FK chain — break the cycle here
        const table = byName.get(tableName);
        if (!table || table.foreignKeys.length === 0) {
            layerCache.set(tableName, 0);
            return 0;
        }

        visiting.add(tableName);
        let maxRefLayer = -1;
        for (const fk of table.foreignKeys) {
            if (fk.refTable === tableName || !byName.has(fk.refTable)) continue;
            maxRefLayer = Math.max(maxRefLayer, computeLayer(fk.refTable, visiting));
        }
        visiting.delete(tableName);

        const layer = maxRefLayer + 1;
        layerCache.set(tableName, layer);
        return layer;
    }

    const layers = new Map<number, ParsedTable[]>();
    for (const table of tables) {
        const layer = computeLayer(table.name, new Set());
        if (!layers.has(layer)) layers.set(layer, []);
        layers.get(layer)!.push(table);
    }

    const positions: ErNodePosition[] = [];
    const sortedLayerKeys = Array.from(layers.keys()).sort((a, b) => a - b);

    for (const layerIndex of sortedLayerKeys) {
        const layerTables = layers.get(layerIndex)!;
        let y = 0;
        const x = layerIndex * (TABLE_NODE_WIDTH + LAYER_GAP_X);
        for (const table of layerTables) {
            const height = tableHeight(table);
            positions.push({ table, x, y, width: TABLE_NODE_WIDTH, height });
            y += height + NODE_GAP_Y;
        }
    }

    return positions;
}
