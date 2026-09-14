"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroupContext = React.createContext<{
  direction: "horizontal" | "vertical"
}>({ direction: "horizontal" })

export interface ResizablePanelGroupProps extends React.ComponentProps<typeof Group> {
  className?: string
  direction: "horizontal" | "vertical"
}

function ResizablePanelGroup({
  className,
  direction,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <ResizablePanelGroupContext.Provider value={{ direction }}>
      <Group
        data-slot="resizable-panel-group"
        data-panel-group-direction={direction}
        orientation={direction}
        className={cn(
          "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
          className
        )}
        {...props}
      />
    </ResizablePanelGroupContext.Provider>
  )
}

function normalizeSize(size: string | number | undefined): string | number | undefined {
  if (typeof size === "number") {
    return `${size}%`;
  }
  return size;
}

export interface ResizablePanelProps extends React.ComponentProps<typeof Panel> {
  className?: string
}

function ResizablePanel({
  className,
  defaultSize,
  minSize,
  maxSize,
  ...props
}: ResizablePanelProps) {
  return (
    <Panel
      data-slot="resizable-panel"
      defaultSize={normalizeSize(defaultSize)}
      minSize={normalizeSize(minSize)}
      maxSize={normalizeSize(maxSize)}
      className={cn(
        "flex flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  const { direction } = React.useContext(ResizablePanelGroupContext)
  return (
    <Separator
      data-slot="resizable-handle"
      data-panel-group-direction={direction}
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px touch-none cursor-col-resize items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
