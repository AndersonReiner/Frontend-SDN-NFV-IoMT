"use client"

import type { CSSProperties } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"

import { Badge, type BadgeProps } from "@/components/reui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type DonutSlice = {
  key: string
  label: string
  value: number
  color: string
}

type MonitoringDonutChartProps = {
  title: string
  description: string
  badgeLabel: string
  badgeVariant?: BadgeProps["variant"]
  data: DonutSlice[]
  centerValue: string
  centerCaption: string
  variant?: "gradient" | "pattern"
  patternKeys?: string[]
}

export function MonitoringDonutChart({
  title,
  description,
  badgeLabel,
  badgeVariant = "info-light",
  data,
  centerValue,
  centerCaption,
  variant = "gradient",
  patternKeys = [],
}: MonitoringDonutChartProps) {
  const chartConfig = data.reduce((acc, slice) => {
    acc[slice.key] = {
      label: slice.label,
      color: slice.color,
    }
    return acc
  }, {} as ChartConfig)

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={badgeVariant} size="sm">
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {data.length ? (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart accessibilityLayer>
                <defs>
                  {variant === "gradient"
                    ? data.map((slice) => (
                        <linearGradient
                          key={slice.key}
                          id={`monitoring-${slice.key}-gradient`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={slice.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={slice.color} stopOpacity={0.8} />
                        </linearGradient>
                      ))
                    : null}
                  {variant === "pattern"
                    ? patternKeys.map((key, index) => {
                        const color = data.find((slice) => slice.key === key)?.color
                        if (!color) return null

                        return (
                          <pattern
                            key={key}
                            id={`monitoring-${key}-pattern`}
                            patternUnits="userSpaceOnUse"
                            width="6"
                            height="6"
                          >
                            <rect width="6" height="6" fill={color} opacity="0.24" />
                            <path
                              d={index % 2 === 0 ? "M0,6 L6,0" : "M0,0 L6,6"}
                              stroke={color}
                              strokeWidth="1.5"
                              opacity="0.9"
                            />
                          </pattern>
                        )
                      })
                    : null}
                </defs>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="key"
                      className="min-w-40 gap-2.5"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-xs bg-(--color-bg)"
                              style={
                                {
                                  "--color-bg": `var(--color-${name})`,
                                } as CSSProperties
                              }
                            />
                            <span className="text-muted-foreground">
                              {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                            </span>
                          </div>
                          <span className="text-foreground font-semibold tabular-nums">
                            {Number(value).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={data.map((slice) => ({
                    ...slice,
                    fill:
                      variant === "gradient"
                        ? `url(#monitoring-${slice.key}-gradient)`
                        : patternKeys.includes(slice.key)
                          ? `url(#monitoring-${slice.key}-pattern)`
                          : `var(--color-${slice.key})`,
                  }))}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={65}
                  outerRadius={95}
                  cornerRadius={8}
                  paddingAngle={4}
                  stroke="var(--background)"
                  strokeWidth={4}
                >
                  {data.map((slice) => (
                    <Cell
                      key={slice.key}
                      fill={
                        variant === "gradient"
                          ? `url(#monitoring-${slice.key}-gradient)`
                          : patternKeys.includes(slice.key)
                            ? `url(#monitoring-${slice.key}-pattern)`
                            : slice.color
                      }
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold tabular-nums"
                            >
                              {centerValue}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                              className="fill-muted-foreground text-xs"
                            >
                              {centerCaption}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {data.map((slice) => (
                <div
                  key={slice.key}
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="min-w-0 truncate text-muted-foreground">
                    {slice.label}
                  </span>
                  <span className="ml-auto shrink-0 font-medium tabular-nums text-foreground">
                    {Number(slice.value).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Sem dados agregados no momento.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
