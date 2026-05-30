"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import type { GroupMetrics } from "@/lib/api/types"

const chartConfig = {
  messages: {
    label: "Mensagens",
    color: "var(--chart-1)",
  },
  throughput_bps: {
    label: "Vazao",
    color: "var(--chart-2)",
  },
  avg_delay_ms: {
    label: "Delay medio",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function TrafficChart({ metrics }: { metrics: GroupMetrics[] }) {
  const data = metrics.map((metric) => ({
    ...metric,
    label: groupLabel(metric.group),
    fill: GROUPS[metric.group].chartColor,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metricas de Trafego por Grupo</CardTitle>
        <CardDescription>
          Volume, vazao e atraso medio calculados a partir dos logs do servidor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart data={data} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} width={44} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                yAxisId="left"
                dataKey="messages"
                fill="var(--color-messages)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="throughput_bps"
                fill="var(--color-throughput_bps)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="avg_delay_ms"
                fill="var(--color-avg_delay_ms)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Sem metricas de trafego no momento.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
