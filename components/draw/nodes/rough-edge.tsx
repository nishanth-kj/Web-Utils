"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

export function RoughEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const minX = Math.min(sourceX, targetX) - 50;
    const minY = Math.min(sourceY, targetY) - 50;
    const width = Math.max(sourceX, targetX) - minX + 50;
    const height = Math.max(sourceY, targetY) - minY + 50;

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // @ts-ignore
        const rough = window.rough;
        if (!rough) return;

        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-minX, -minY);

        const options = {
            stroke: selected ? '#3b82f6' : (style.stroke as string || '#b1b1b7'),
            strokeWidth: selected ? 3 : (style.strokeWidth as number || 2),
            roughness: 1,
        };

        // RoughJS path drawing
        rc.path(edgePath, options);

        // Draw arrow head at target
        const arrowLength = 10;
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        
        const x1 = targetX - arrowLength * Math.cos(angle - Math.PI / 6);
        const y1 = targetY - arrowLength * Math.sin(angle - Math.PI / 6);
        const x2 = targetX - arrowLength * Math.cos(angle + Math.PI / 6);
        const y2 = targetY - arrowLength * Math.sin(angle + Math.PI / 6);

        rc.line(targetX, targetY, x1, y1, options);
        rc.line(targetX, targetY, x2, y2, options);

        // Draw arrow head at source (both ends)
        const sx1 = sourceX + arrowLength * Math.cos(angle - Math.PI / 6);
        const sy1 = sourceY + arrowLength * Math.sin(angle - Math.PI / 6);
        const sx2 = sourceX + arrowLength * Math.cos(angle + Math.PI / 6);
        const sy2 = sourceY + arrowLength * Math.sin(angle + Math.PI / 6);

        rc.line(sourceX, sourceY, sx1, sy1, options);
        rc.line(sourceX, sourceY, sx2, sy2, options);
        ctx.restore();
    }, [edgePath, selected, style, targetX, targetY, sourceX, sourceY, minX, minY]);

    return (
        <>
            <path
                id={id}
                style={{ ...style, stroke: 'transparent', strokeWidth: 20 }}
                className="react-flow__edge-path"
                d={edgePath}
            />
            <foreignObject
                width={width}
                height={height}
                x={minX}
                y={minY}
                className="pointer-events-none"
            >
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full h-full"
                />
            </foreignObject>
        </>
    );
}
