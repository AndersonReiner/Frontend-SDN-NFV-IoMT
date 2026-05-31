"use client"

import { useId, type CSSProperties } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { GROUPS, groupLabel } from "@/config/groups"
import { Badge, type BadgeProps } from "@/components/reui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatNumber } from "@/lib/format"
import type { GroupTrendRow } from "@/components/dashboard/monitoring-area-chart"

type MonitoringJitterChartProps = {
  data: GroupTrendRow[]
  title: string
  description: string
  badgeLabel: string
  badgeVariant?: BadgeProps["variant"]
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

export function MonitoringJitterChart({
  data,
  title,
  description,
  badgeLabel,
  badgeVariant = "info-light",
}: MonitoringJitterChartProps) {
  const chartId = useId().replace(/:/g, "")

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
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 2, bottom: 0, left: 2 }}
            >
              <defs>
                {GROUP_KEYS.map((key) => (
                  <linearGradient
                    key={key}
                    id={`${chartId}-${key}-fill`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={chartConfig[key].color}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartConfig[key].color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
                <filter
                  id={`${chartId}-dot-glow`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter
                  id={`${chartId}-line-glow`}
                  x="-10%"
                  y="-20%"
                  width="120%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
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
                tickFormatter={(value) => `${formatNumber(Number(value), 2)} ms`}
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
                          {formatNumber(Number(value), 3)} ms
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
                  fill={`url(#${chartId}-${key}-fill)`}
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  filter={`url(#${chartId}-line-glow)`}
                  dot={{
                    r: 4,
                    fill: `var(--color-${key})`,
                    strokeWidth: 2,
                    stroke: "var(--background)",
                    filter: `url(#${chartId}-dot-glow)`,
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 3,
                    stroke: "var(--background)",
                  }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Sem dados de jitter no momento.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
