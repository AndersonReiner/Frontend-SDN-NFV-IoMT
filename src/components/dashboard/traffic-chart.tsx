"use client"

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/reui/badge"

import { GROUPS, groupLabel } from "@/config/groups"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { GroupMetrics, GroupName } from "@/lib/api/types"
import { formatBits, formatBytes, formatNumber } from "@/lib/format"
import { TrendingUpIcon } from "lucide-react"

type TrafficChartRow = {
  group: GroupName
  label: string
  bytes: number
  messages: number
  throughput_bps: number
  fill: string
}

const GROUP_KEYS: GroupName[] = ["uti", "enfermaria", "triagem"]

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

function buildTrafficRows(metrics: GroupMetrics[]): TrafficChartRow[] {
  return GROUP_KEYS.map((group) => {
    const metric = metrics.find((item) => item.group === group)

    return {
      group,
      label: groupLabel(group),
      bytes: metric?.bytes ?? 0,
      messages: metric?.messages ?? 0,
      throughput_bps: metric?.throughput_bps ?? 0,
      fill: `url(#traffic-${group}-pattern)`,
    }
  })
}

export function TrafficChart({ metrics }: { metrics: GroupMetrics[] }) {
  const data = buildTrafficRows(metrics)
  const totalBytes = data.reduce((sum, item) => sum + item.bytes, 0)
  const peakGroup = [...data].sort((a, b) => b.bytes - a.bytes)[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Metricas de Trafego por Grupo</CardTitle>
            <CardDescription>
              Volume de bytes por grupo calculado a partir dos logs do servidor.
            </CardDescription>
          </div>
          <Badge variant="success-light" size="sm">
            <TrendingUpIcon aria-hidden="true" />
            Tail 1000
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 12, bottom: 12, left: 12 }}
            >
              <defs>
                {GROUP_KEYS.map((group) => (
                  <pattern
                    key={group}
                    id={`traffic-${group}-pattern`}
                    x="0"
                    y="0"
                    width="5"
                    height="5"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      width="5"
                      height="5"
                      fill={GROUPS[group].chartColor}
                      opacity="0.1"
                    />
                    <circle
                      cx="5"
                      cy="5"
                      r="1.4"
                      fill={GROUPS[group].chartColor}
                      opacity="0.6"
                    />
                  </pattern>
                ))}
              </defs>
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
                tickFormatter={(value) => formatBytes(Number(value))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    nameKey="group"
                    indicator="dot"
                    className="min-w-40 gap-2.5"
                    formatter={(value, _name, item) => {
                      const payload = item.payload as TrafficChartRow | undefined

                      return (
                        <div className="flex w-full flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                              {payload?.label ?? "Grupo"}
                            </span>
                            <span className="text-foreground font-semibold tabular-nums">
                              {formatBytes(Number(value))}
                            </span>
                          </div>
                          {payload ? (
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(payload.messages)} mensagens
                              {" · "}
                              {formatBits(payload.throughput_bps)}
                            </div>
                          ) : null}
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar dataKey="bytes" radius={[4, 4, 4, 4]}>
                {data.map((entry) => (
                  <Cell key={entry.group} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Sem metricas de trafego no momento.
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Total: {formatBytes(totalBytes)}</span>
          <span>
            Pico: {peakGroup ? `${peakGroup.label} ${formatBytes(peakGroup.bytes)}` : "-"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
