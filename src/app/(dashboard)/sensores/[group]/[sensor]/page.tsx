import Link from "next/link"

import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh"
import { GROUPS, groupLabel } from "@/config/groups"
import { ApiNotice } from "@/components/shared/api-notice"
import { MetricCard } from "@/components/shared/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet } from "@/lib/api/server"
import type { GroupName, SensorMetrics } from "@/lib/api/types"
import {
  formatBits,
  formatDateTime,
  formatMs,
  formatNumber,
  formatPercent,
  formatReading,
} from "@/lib/format"
import { ActivityIcon, ArrowLeftIcon, ClockIcon, RadioIcon } from "lucide-react"

export const unstable_instant = {
  prefetch: "static",
  samples: [
    { params: { group: "uti", sensor: "sensor-uti-1" } },
    { params: { group: "enfermaria", sensor: "sensor-enfermaria-1" } },
    { params: { group: "triagem", sensor: "sensor-triagem-1" } },
  ],
}

type PageProps = {
  params: Promise<{
    group: GroupName
    sensor: string
  }>
}

export default async function SensorDetailPage({ params }: PageProps) {
  const { group, sensor } = await params
  const result = await apiGet<SensorMetrics>(
    `/groups/${group}/sensors/${sensor}/metrics?tail=1000`
  )

  if (!result.ok) {
    return (
      <>
        <DashboardAutoRefresh intervalMs={5000} />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/sensores" />}
        >
          <ArrowLeftIcon />
          Sensores
        </Button>
        <ApiNotice result={result} />
      </>
    )
  }

  const metric = result.data
  const groupMeta = GROUPS[metric.group]

  return (
    <>
      <DashboardAutoRefresh intervalMs={5000} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/sensores" />}
            >
              <ArrowLeftIcon />
              Sensores
            </Button>
            <Badge className={groupMeta.color} variant="outline">
              {groupLabel(metric.group)}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {metric.sensor}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ultima leitura: {formatDateTime(metric.last_seen)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Mensagens"
          value={formatNumber(metric.messages)}
          description={`${formatNumber(metric.messages_per_second, 3)} msg/s`}
          icon={ActivityIcon}
        />
        <MetricCard
          title="Vazao"
          value={formatBits(metric.throughput_bps)}
          description={`${formatNumber(metric.avg_payload_bytes, 1)} bytes payload medio`}
          icon={RadioIcon}
        />
        <MetricCard
          title="Delay medio"
          value={formatMs(metric.avg_delay_ms)}
          description={`Jitter ${formatMs(metric.jitter_ms)}`}
          icon={ClockIcon}
        />
        <MetricCard
          title="Perda"
          value={formatPercent(metric.packet_loss_percent)}
          description={`${metric.missing_messages} ausentes de ${metric.expected_messages}`}
          icon={ActivityIcon}
          tone={metric.packet_loss_percent > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leitura Recente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {formatReading(metric.last_reading)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Origens Observadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {metric.origins.map((origin) => (
              <div key={origin} className="rounded-md border px-3 py-2">
                {origin}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estatisticas por Campo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(metric.reading_stats).map(([field, stats]) => (
              <div key={field} className="rounded-lg border p-3">
                <div className="font-medium">{field.replaceAll("_", " ")}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Amostras: {stats.samples}</span>
                  <span>Ultimo: {stats.last ?? "-"}</span>
                  <span>Min: {stats.min ?? "-"}</span>
                  <span>Max: {stats.max ?? "-"}</span>
                  <span>Media: {stats.avg ?? "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
