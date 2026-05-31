"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"

import { GROUPS, groupLabel } from "@/config/groups"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatBits, formatNumber } from "@/lib/format"
import type { GroupName } from "@/lib/api/types"

type GroupRadarPoint = {
  metric: string
  key: string
  value: number
  raw: number
}

type GroupRadarSeries = {
  group: GroupName
  points: GroupRadarPoint[]
}

type MonitoringTrafficRadarGridProps = {
  title: string
  description: string
  groups: GroupRadarSeries[]
}

const chartConfig = {
  value: { label: "Score", color: "var(--chart-2)" },
} satisfies ChartConfig

function formatMetricValue(metric: string, value: number) {
  switch (metric) {
    case "packet_loss_percent":
      return `${formatNumber(value, 2)}%`
    case "messages_per_second":
      return `${formatNumber(value, 2)} msg/s`
    case "throughput_bps":
      return formatBits(value)
    case "avg_delay_ms":
      return `${formatNumber(value, 3)} ms`
    case "missing_messages":
      return formatNumber(value)
    default:
      return formatNumber(value, 2)
  }
}

export function MonitoringTrafficRadarGrid({
  title,
  description,
  groups,
}: MonitoringTrafficRadarGridProps) {
  return (
    <div className="space-y-4 xl:col-span-2">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((groupData) => (
          <TrafficRadarCard key={groupData.group} groupData={groupData} />
        ))}
      </div>
    </div>
  )
}

function TrafficRadarCard({ groupData }: { groupData: GroupRadarSeries }) {
  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>{groupLabel(groupData.group)}</CardTitle>
        <CardDescription>Metricas de trafego do grupo</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{
            value: {
              ...chartConfig.value,
              color: GROUPS[groupData.group].chartColor,
            },
          }}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart accessibilityLayer data={groupData.points}>
            <defs>
              <linearGradient
                id={`traffic-radar-${groupData.group}-fill`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.1} />
              </linearGradient>
              <filter
                id={`traffic-radar-${groupData.group}-glow`}
                x="-15%"
                y="-15%"
                width="130%"
                height="130%"
              >
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(_value, _name, item) => {
                    const payload = item.payload as GroupRadarPoint
                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-muted-foreground">{payload.metric}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatMetricValue(payload.key, payload.raw)}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
            <PolarGrid strokeDasharray="3 3" />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="value"
              fill={`url(#traffic-radar-${groupData.group}-fill)`}
              stroke="var(--color-value)"
              strokeWidth={2.5}
              filter={`url(#traffic-radar-${groupData.group}-glow)`}
              dot={{
                r: 4,
                fill: "var(--background)",
                strokeWidth: 2.5,
                stroke: "var(--color-value)",
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
