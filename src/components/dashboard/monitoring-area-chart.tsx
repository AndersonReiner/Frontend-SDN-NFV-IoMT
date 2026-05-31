"use client"

import { useId, type CSSProperties } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { GROUPS, groupLabel } from "@/config/groups"
import { Badge } from "@/components/reui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatBits, formatNumber } from "@/lib/format"
import type { BadgeProps } from "@/components/reui/badge"

export type GroupTrendRow = {
  timestamp: string
  label: string
  uti: number | null
  enfermaria: number | null
  triagem: number | null
}

type TrendVariant = "pattern" | "glow"

type MonitoringAreaChartProps = {
  title: string
  description: string
  badgeLabel: string
  badgeVariant?: BadgeProps["variant"]
  data: GroupTrendRow[]
  valueLabel: string
  valueFormat: "ms" | "bps"
  variant?: TrendVariant
}

const chartConfig = {
  uti: {
    label: groupLabel("uti"),
    color: GROUPS.uti.chartColor,
  },
  enfermaria: {
    label: groupLabel("enfermaria"),
    color: GROUPS.enfermaria.chartColor,
  },
  triagem: {
    label: groupLabel("triagem"),
    color: GROUPS.triagem.chartColor,
  },
} satisfies ChartConfig

const GROUP_KEYS = ["uti", "enfermaria", "triagem"] as const

export function MonitoringAreaChart({
  title,
  description,
  badgeLabel,
  badgeVariant = "success-light",
  data,
  valueLabel,
  valueFormat,
  variant = "pattern",
}: MonitoringAreaChartProps) {
  const chartId = useId().replace(/:/g, "")

  function formatAxisValue(value: number) {
    if (valueFormat === "bps") return formatBits(value)
    return formatNumber(value, 2)
  }

  function formatTooltipValue(value: number) {
    if (valueFormat === "bps") return formatBits(value)
    return `${formatNumber(value, 3)} ms`
  }

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
      <CardContent>
        {data.length ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
            id={chartId}
          >
            <AreaChart data={data} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
              <defs>
                {GROUP_KEYS.map((key) => {
                  const color = chartConfig[key].color
                  if (variant === "glow") {
                    return (
                      <linearGradient
                        key={key}
                        id={`${chartId}-${key}-gradient`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    )
                  }

                  return (
                    <pattern
                      key={key}
                      id={`${chartId}-${key}-pattern`}
                      x="0"
                      y="0"
                      width="8"
                      height="8"
                      patternUnits="userSpaceOnUse"
                    >
                      <path d="M0,8 L8,0" stroke={color} strokeWidth="0.8" opacity="0.4" />
                      <path d="M0,0 L8,8" stroke={color} strokeWidth="0.8" opacity="0.2" />
                    </pattern>
                  )
                })}
                {variant === "glow" ? (
                  <filter
                    id={`${chartId}-glow`}
                    x="-10%"
                    y="-20%"
                    width="120%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                ) : null}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={formatAxisValue}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="min-w-40 gap-2.5"
                    labelFormatter={(label) => (
                      <div className="border-border/50 mb-0.5 border-b pb-2">
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    )}
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
                          {formatTooltipValue(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend
                content={<ChartLegendContent />}
                className="-translate-y-1"
              />
              {GROUP_KEYS.map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="natural"
                  fill={
                    variant === "glow"
                      ? `url(#${chartId}-${key}-gradient)`
                      : `url(#${chartId}-${key}-pattern)`
                  }
                  fillOpacity={variant === "glow" ? 0.55 : 0.85}
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  filter={variant === "glow" ? `url(#${chartId}-glow)` : undefined}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Sem dados de {valueLabel.toLowerCase()} no momento.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
