import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "../../lib/utils"

export type ChartConfig = Record<string, { label?: string; color?: string }>

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactElement
}) {
  const style = Object.fromEntries(
    Object.entries(config).flatMap(([key, value]) =>
      value.color ? [[`--color-${key}`, value.color]] : []
    )
  ) as React.CSSProperties

  return (
    <div
      data-slot="chart"
      className={cn(
        "w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-tooltip-cursor]:fill-muted/40",
        className
      )}
      style={style}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export { ChartContainer }
