export const unstable_instant = { prefetch: "static" }

import { Suspense } from "react"
import {
  ActivityIcon,
  ContainerIcon,
  HeartPulseIcon,
  RouterIcon,
} from "lucide-react"

import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh"
import { MonitoringChartsSection } from "@/components/dashboard/monitoring-charts"
import {
  CardBlockSkeleton,
  MetricCardsSkeleton,
  MonitoringChartsSkeleton,
} from "@/components/shared/page-skeletons"
import { ApiNotice } from "@/components/shared/api-notice"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type {
  ContainerInfo,
  GatewayStatus,
  HealthResponse,
  StatusResponse,
  TimeseriesStats,
  TrafficMetrics,
} from "@/lib/api/types"
import { formatNumber } from "@/lib/format"

/**
 * Pagina principal do dashboard operacional da simulacao.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <DashboardAutoRefresh intervalMs={5000} />
      <Suspense fallback={<MetricCardsSkeleton />}>
        <DashboardMetricsSection />
      </Suspense>

      <Suspense fallback={<MonitoringChartsSkeleton />}>
        <MonitoringChartsSection />
      </Suspense>

      <Suspense fallback={<CardBlockSkeleton titleWidth="w-48" rows={8} />}>
        <DashboardContainersSection />
      </Suspense>
    </div>
  )
}

/**
 * Secao server-side que consolida os indicadores globais do ambiente.
 */
async function DashboardMetricsSection() {
  const [health, status, gateways, traffic, timeseriesStats] = await Promise.all([
    apiGet<HealthResponse>("/health"),
    apiGet<StatusResponse>("/status"),
    apiGet<Record<string, GatewayStatus>>("/gateways"),
    apiGet<TrafficMetrics>("/metrics/traffic?tail=1000"),
    apiGet<TimeseriesStats>("/timeseries/stats"),
  ])

  const statusData = dataOr(status, {
    project: "-",
    total_containers: 0,
    running: 0,
    services: {},
  })
  const gatewayData = Object.values(dataOr(gateways, {}))

  return (
    <section className="space-y-4">
      {[health, status, gateways, traffic, timeseriesStats]
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`metrics-${index}`} result={result} />
        ))}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="API"
          value={health.ok ? health.data.status.toUpperCase() : "offline"}
          description={health.ok ? `Docker ${health.data.docker}` : health.message}
          icon={HeartPulseIcon}
          tone={health.ok ? "success" : "danger"}
        />
        <MetricCard
          title="Containers"
          value={`${statusData.running}/${statusData.total_containers}`}
          description={`Projeto ${statusData.project}`}
          icon={ContainerIcon}
          tone={statusData.running === statusData.total_containers ? "success" : "warning"}
        />
        <MetricCard
          title="Gateways"
          value={formatNumber(gatewayData.filter((gateway) => gateway.running).length)}
          description={`${gatewayData.length} gateways mapeados`}
          icon={RouterIcon}
        />
        <MetricCard
          title="Snapshots Persistidos"
          value={formatNumber(timeseriesStats.ok ? timeseriesStats.data.total_rows : 0)}
          description={
            timeseriesStats.ok
              ? `SQLite em ${timeseriesStats.data.db_path}`
              : "Banco de metricas indisponivel"
          }
          icon={ActivityIcon}
        />
      </div>
    </section>
  )
}

/**
 * Secao server-side que lista os containers monitorados pelo backend.
 */
async function DashboardContainersSection() {
  const containers = await apiGet<ContainerInfo[]>("/containers")
  const containerData = dataOr(containers, [])

  return (
    <>
      {!containers.ok ? <ApiNotice result={containers} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Containers do Compose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {containerData.map((container) => (
              <div
                key={container.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{container.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {container.image}
                  </div>
                </div>
                <StatusBadge tone={container.status === "running" ? "success" : "warning"}>
                  {container.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
