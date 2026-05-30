import { Suspense } from "react"
import {
  ActivityIcon,
  ContainerIcon,
  HeartPulseIcon,
  RouterIcon,
} from "lucide-react"

import { TrafficChart } from "@/components/dashboard/traffic-chart"
import { GatewaySummaryTable } from "@/components/gateways/gateway-summary-table"
import {
  CardBlockSkeleton,
  ChartSkeleton,
  DataGridSkeleton,
  MetricCardsSkeleton,
} from "@/components/shared/page-skeletons"
import { ApiNotice } from "@/components/shared/api-notice"
import { MetricCard } from "@/components/shared/metric-card"
import { SensorMetricsGrid } from "@/components/sensors/sensor-metrics-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type {
  ContainerInfo,
  GatewayStatus,
  HealthResponse,
  SensorMetrics,
  SensorMetricsCollection,
  StatusResponse,
  TrafficMetrics,
} from "@/lib/api/types"
import { formatNumber } from "@/lib/format"

function flattenSensors(collection: SensorMetricsCollection): SensorMetrics[] {
  return Object.values(collection.groups).flatMap((group) =>
    Object.values(group ?? {})
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Suspense fallback={<MetricCardsSkeleton />}>
        <DashboardMetricsSection />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <DashboardTrafficSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <DataGridSkeleton titleWidth="w-40" columns={8} rows={5} />
            <CardBlockSkeleton titleWidth="w-36" rows={6} />
          </div>
        }
      >
        <DashboardOperationsSection />
      </Suspense>

      <Suspense fallback={<CardBlockSkeleton titleWidth="w-48" rows={8} />}>
        <DashboardContainersSection />
      </Suspense>
    </div>
  )
}

async function DashboardMetricsSection() {
  const [health, status, gateways, traffic, sensors] = await Promise.all([
    apiGet<HealthResponse>("/health"),
    apiGet<StatusResponse>("/status"),
    apiGet<Record<string, GatewayStatus>>("/gateways"),
    apiGet<TrafficMetrics>("/metrics/traffic?tail=1000"),
    apiGet<SensorMetricsCollection>("/sensors/metrics?tail=1000"),
  ])

  const statusData = dataOr(status, {
    project: "-",
    total_containers: 0,
    running: 0,
    services: {},
  })
  const gatewayData = Object.values(dataOr(gateways, {}))
  const trafficData = dataOr(traffic, {
    source: "",
    parsed_lines: 0,
    ignored_lines: 0,
    groups: {},
  })
  const sensorRows = flattenSensors(
    dataOr(sensors, {
      source: "",
      parsed_lines: 0,
      ignored_lines: 0,
      groups: {},
    })
  )

  return (
    <>
      {[health, status, gateways, traffic, sensors]
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
          title="Logs Parseados"
          value={formatNumber(trafficData.parsed_lines)}
          description={`${formatNumber(sensorRows.length)} sensores clinicos ativos`}
          icon={ActivityIcon}
        />
      </div>
    </>
  )
}

async function DashboardTrafficSection() {
  const traffic = await apiGet<TrafficMetrics>("/metrics/traffic?tail=1000")
  const trafficData = dataOr(traffic, {
    source: "",
    parsed_lines: 0,
    ignored_lines: 0,
    groups: {},
  })

  return (
    <>
      {!traffic.ok ? <ApiNotice result={traffic} /> : null}
      <TrafficChart metrics={Object.values(trafficData.groups)} />
    </>
  )
}

async function DashboardOperationsSection() {
  const [gateways, sensors] = await Promise.all([
    apiGet<Record<string, GatewayStatus>>("/gateways"),
    apiGet<SensorMetricsCollection>("/sensors/metrics?tail=1000"),
  ])

  const gatewayData = Object.values(dataOr(gateways, {}))
  const sensorRows = flattenSensors(
    dataOr(sensors, {
      source: "",
      parsed_lines: 0,
      ignored_lines: 0,
      groups: {},
    })
  )

  return (
    <>
      {[gateways, sensors]
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`ops-${index}`} result={result} />
        ))}

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Sensores Clinicos</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorMetricsGrid sensors={sensorRows} compact />
          </CardContent>
        </Card>
        <GatewaySummaryTable gateways={gatewayData} />
      </div>
    </>
  )
}

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
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900">
                  {container.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
