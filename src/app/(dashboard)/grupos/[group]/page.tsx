import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ActivityIcon, NetworkIcon, RadioIcon, TimerIcon } from "lucide-react"

import { GROUPS, groupLabel } from "@/config/groups"
import { GatewayCommandCard } from "@/components/gateways/gateway-command-card"
import { LogsBlock } from "@/components/logs/logs-block"
import { SensorMetricsGrid } from "@/components/sensors/sensor-metrics-grid"
import { ApiNotice } from "@/components/shared/api-notice"
import {
  CardBlockSkeleton,
  DataGridSkeleton,
  LogsSkeleton,
  MetricCardsSkeleton,
} from "@/components/shared/page-skeletons"
import { MetricCard } from "@/components/shared/metric-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type {
  GroupInfo,
  GroupMetrics,
  GroupName,
  GroupRoutes,
  LogsResponse,
  SensorMetrics,
} from "@/lib/api/types"
import { formatBits, formatMs, formatNumber, formatPercent } from "@/lib/format"

type PageProps = {
  params: Promise<{ group: GroupName }>
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { group } = await params
  if (!GROUPS[group]) notFound()

  return (
    <div className="space-y-4 md:space-y-6">
      <Suspense fallback={<CardBlockSkeleton titleWidth="w-40" rows={3} />}>
        <GroupHeaderSection group={group} />
      </Suspense>

      <Suspense fallback={<MetricCardsSkeleton />}>
        <GroupMetricsSection group={group} />
      </Suspense>

      <Suspense fallback={<DataGridSkeleton titleWidth="w-40" columns={8} rows={5} />}>
        <GroupSensorsSection group={group} />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-4 xl:grid-cols-2">
            <CardBlockSkeleton titleWidth="w-40" rows={5} />
            <CardBlockSkeleton titleWidth="w-52" rows={6} />
          </div>
        }
      >
        <GroupRoutesSection group={group} />
      </Suspense>

      <Suspense fallback={<LogsSkeleton columns={1} />}>
        <GroupLogsSection group={group} />
      </Suspense>
    </div>
  )
}

async function GroupHeaderSection({ group }: { group: GroupName }) {
  const info = await apiGet<GroupInfo>(`/groups/${group}`)
  const groupInfo = dataOr(info, {
    group,
    gateway: GROUPS[group].gateway,
    sensors: [],
  })

  return (
    <>
      {!info.ok ? <ApiNotice result={info} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge className={GROUPS[group].color} variant="outline">
            {GROUPS[group].network}
          </Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            {groupLabel(group)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gateway {groupInfo.gateway} com {groupInfo.sensors.length} containers de sensores.
          </p>
        </div>
      </div>
    </>
  )
}

async function GroupMetricsSection({ group }: { group: GroupName }) {
  const metrics = await apiGet<GroupMetrics>(`/groups/${group}/metrics?tail=1000`)

  if (!metrics.ok) {
    return <ApiNotice result={metrics} />
  }

  const groupMetrics = metrics.data

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Mensagens"
        value={formatNumber(groupMetrics.messages)}
        description={`${formatNumber(groupMetrics.messages_per_second, 3)} msg/s`}
        icon={ActivityIcon}
      />
      <MetricCard
        title="Vazao"
        value={formatBits(groupMetrics.throughput_bps)}
        description={`${formatNumber(groupMetrics.bytes)} bytes`}
        icon={RadioIcon}
      />
      <MetricCard
        title="Delay"
        value={formatMs(groupMetrics.avg_delay_ms)}
        description={`Jitter ${formatMs(groupMetrics.jitter_ms)}`}
        icon={TimerIcon}
      />
      <MetricCard
        title="Perda"
        value={formatPercent(groupMetrics.packet_loss_percent)}
        description={`${groupMetrics.missing_messages} mensagens ausentes`}
        icon={NetworkIcon}
        tone={groupMetrics.packet_loss_percent > 0 ? "warning" : "success"}
      />
    </div>
  )
}

async function GroupSensorsSection({ group }: { group: GroupName }) {
  const sensors = await apiGet<Record<string, SensorMetrics>>(
    `/groups/${group}/sensors/metrics?tail=1000`
  )
  const sensorRows = Object.values(dataOr(sensors, {}))

  return (
    <>
      {!sensors.ok ? <ApiNotice result={sensors} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Sensores Clinicos</CardTitle>
        </CardHeader>
        <CardContent>
          <SensorMetricsGrid sensors={sensorRows} compact />
        </CardContent>
      </Card>
    </>
  )
}

async function GroupRoutesSection({ group }: { group: GroupName }) {
  const routes = await apiGet<GroupRoutes>(`/groups/${group}/routes`)
  const routeData = routes.ok ? routes.data : null

  return (
    <>
      {!routes.ok ? <ApiNotice result={routes} /> : null}
      {routeData ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <GatewayCommandCard title="Rota do Gateway" result={routeData.gateway} />
          <Card>
            <CardHeader>
              <CardTitle>Rotas dos Containers de Sensores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(routeData.sensors).map((result) => (
                <GatewayCommandCard
                  key={result.container}
                  title={result.container}
                  result={result}
                  compact
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  )
}

async function GroupLogsSection({ group }: { group: GroupName }) {
  const logs = await apiGet<LogsResponse>(`/groups/${group}/logs?tail=80`)
  const logsData = dataOr(logs, { group, source: "server", logs: [] })

  return (
    <>
      {!logs.ok ? <ApiNotice result={logs} /> : null}
      <LogsBlock title={`Logs de ${groupLabel(group)}`} logs={logsData.logs} />
    </>
  )
}
