import { getNodesBounds, getViewportForBounds, type Node, type Viewport } from "reactflow";

/**
 * Computes the viewport that fits `nodes` inside a `width`x`height` container.
 *
 * This intentionally avoids the imperative `fitView()` from `useReactFlow()`:
 * in this app's React 19 + reactflow 11 setup, that hook's `d3Zoom`/`d3Selection`
 * subscription never reflects the store's real values in the component that calls
 * it (confirmed by direct testing — raw wheel-zoom on the pane works fine, so the
 * store itself is correct, but `fitView()`/`viewportInitialized` from the hook
 * stay permanently stale). `getNodesBounds`/`getViewportForBounds` are plain
 * functions with no store subscription, so they're unaffected. The caller applies
 * the result via the `defaultViewport` prop on a remounted `<ReactFlow>` (keyed by
 * generation), since that prop is what reactflow's own mount effect reliably applies.
 */
export function computeFitViewport(nodes: Node[], containerWidth: number, containerHeight: number, padding = 0.2): Viewport {
    if (nodes.length === 0 || containerWidth <= 0 || containerHeight <= 0) {
        return { x: 0, y: 0, zoom: 1 };
    }
    const bounds = getNodesBounds(nodes);
    return getViewportForBounds(bounds, containerWidth, containerHeight, 0.1, 1.5, padding);
}
