import { Badge } from "@/components/reui/badge"
import { ApiNotice } from "@/components/shared/api-notice"
import { MonitoringAreaChart, type GroupTrendRow } from "@/components/dashboard/monitoring-area-chart"
import { MonitoringJitterChart } from "@/components/dashboard/monitoring-jitter-chart"
import { MonitoringTrafficRadarGrid } from "@/components/dashboard/monitoring-traffic-radar-grid"
import {
  MonitoringDonutChart,
  type DonutSlice,
} from "@/components/dashboard/monitoring-donut-chart"
import { GROUPS, groupLabel } from "@/config/groups"
import { apiGet, dataOr } from "@/lib/api/server"
import type {
  GroupName,
  SensorMetricsSnapshot,
  SensorSeries,
  TimeseriesMetricsResponse,
  TimeseriesSeries,
  TimeseriesStats,
  TrafficMetrics,
} from "@/lib/api/types"
import { formatBytes, formatDateTime, formatNumber } from "@/lib/format"

type TimestampBucket = Partial<Record<GroupName, { sum: number; count: number }>>

const GROUP_KEYS: GroupName[] = ["uti", "enfermaria", "triagem"]
const RECENT_WINDOW_MINUTES = 30

/**
 * Formata o timestamp usado no eixo X dos graficos de monitoramento.
 */
function formatChartTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

/**
 * Calcula a media do bucket agregado para um grupo em um instante.
 */
function averageBucket(bucket?: { sum: number; count: number }) {
  if (!bucket || !bucket.count) return null
  return bucket.sum / bucket.count
}

/**
 * Retorna a soma acumulada do bucket agregado para um grupo em um instante.
 */
function sumBucket(bucket?: { sum: number; count: number }) {
  if (!bucket || !bucket.count) return null
  return bucket.sum
}

/**
 * Define a janela recente de consulta historica a partir da ultima captura persistida.
 */
function buildRecentWindowSince(lastCapture: string | null) {
  if (!lastCapture) return null

  const capturedAt = new Date(lastCapture)
  if (Number.isNaN(capturedAt.getTime())) return null

  capturedAt.setMinutes(capturedAt.getMinutes() - RECENT_WINDOW_MINUTES)
  return capturedAt.toISOString()
}

/**
 * Agrega series por timestamp e grupo para alimentar os graficos do dashboard.
 */
function buildTrendRows(series: SensorSeries[], mode: "average" | "sum"): GroupTrendRow[] {
  const buckets = new Map<string, TimestampBucket>()

  for (const item of series) {
    for (const point of item.points) {
      if (point.v === null || point.v === undefined) continue
      const existing = buckets.get(point.t) ?? {}
      const bucket = existing[item.group] ?? { sum: 0, count: 0 }
      bucket.sum += point.v
      bucket.count += 1
      existing[item.group] = bucket
      buckets.set(point.t, existing)
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, bucket]) => ({
      timestamp,
      label: formatChartTime(timestamp),
      uti: mode === "sum" ? sumBucket(bucket.uti) : averageBucket(bucket.uti),
      enfermaria: mode === "sum" ? sumBucket(bucket.enfermaria) : averageBucket(bucket.enfermaria),
      triagem: mode === "sum" ? sumBucket(bucket.triagem) : averageBucket(bucket.triagem),
    }))
}

/**
 * Converte metricas de trafego em fatias para o grafico de distribuicao por grupo.
 */
function buildTrafficSlices(traffic: TrafficMetrics): DonutSlice[] {
  return GROUP_KEYS.map((group) => ({
    key: group,
    label: groupLabel(group),
    value: traffic.groups[group]?.bytes ?? 0,
    color: GROUPS[group].chartColor,
  }))
}

/**
 * Classifica um snapshot de sensor em faixas operacionais usadas pelo donut de saude.
 */
function classifySnapshot(snapshot: SensorMetricsSnapshot) {
  const avgDelay = snapshot.avg_delay_ms ?? 0
  const maxDelay = snapshot.max_delay_ms ?? 0
  const loss = snapshot.packet_loss_percent ?? 0

  if (loss >= 2 || maxDelay >= 15) return "critical"
  if (maxDelay >= 8 || avgDelay >= 0.62 || (snapshot.jitter_ms ?? 0) >= 0.35) {
    return "warning"
  }

  return "healthy"
}

/**
 * Resume a distribuicao de saude dos sensores mais recentes.
 */
function buildHealthSlices(snapshots: SensorMetricsSnapshot[]): DonutSlice[] {
  const totals = snapshots.reduce(
    (acc, snapshot) => {
      acc[classifySnapshot(snapshot)] += 1
      return acc
    },
    {
      healthy: 0,
      warning: 0,
      critical: 0,
    }
  )

  return [
    {
      key: "healthy",
      label: "Estavel",
      value: totals.healthy,
      color: "var(--chart-2)",
    },
    {
      key: "warning",
      label: "Atencao",
      value: totals.warning,
      color: "var(--chart-4)",
    },
    {
      key: "critical",
      label: "Critico",
      value: totals.critical,
      color: "var(--destructive)",
    },
  ]
}

/**
 * Normaliza valores heterogeneos em uma escala 0-100 para comparacao visual.
 */
function normalizeMetricRow(values: Record<GroupName, number>) {
  const max = Math.max(values.uti, values.enfermaria, values.triagem, 0)
  if (max <= 0) {
    return {
      uti: 0,
      enfermaria: 0,
      triagem: 0,
    }
  }

  return {
    uti: (values.uti / max) * 100,
    enfermaria: (values.enfermaria / max) * 100,
    triagem: (values.triagem / max) * 100,
  }
}

/**
 * Monta a estrutura do radar de trafego preservando valor bruto e score normalizado.
 */
function buildTrafficRadarGroups(traffic: TrafficMetrics) {
  const attributes = [
    { key: "packet_loss_percent", label: "Perda" },
    { key: "messages_per_second", label: "Msgs/s" },
    { key: "throughput_bps", label: "Vazao" },
    { key: "avg_delay_ms", label: "Delay" },
    { key: "missing_messages", label: "Faltantes" },
  ] as const

  const normalizedByAttribute = Object.fromEntries(
    attributes.map((attribute) => {
      const raw = {
        uti: Number(traffic.groups.uti?.[attribute.key] ?? 0),
        enfermaria: Number(traffic.groups.enfermaria?.[attribute.key] ?? 0),
        triagem: Number(traffic.groups.triagem?.[attribute.key] ?? 0),
      }

      return [attribute.key, { raw, normalized: normalizeMetricRow(raw) }]
    })
  ) as Record<
    (typeof attributes)[number]["key"],
    {
      raw: Record<GroupName, number>
      normalized: Record<GroupName, number>
    }
  >

  return GROUP_KEYS.map((group) => ({
    group,
    points: attributes.map((attribute) => ({
      metric: attribute.label,
      key: attribute.key,
      value: normalizedByAttribute[attribute.key].normalized[group],
      raw: normalizedByAttribute[attribute.key].raw[group],
    })),
  }))
}

/**
 * Secao server-side do dashboard responsavel por monitoramento temporal e comparativo.
 */
export async function MonitoringChartsSection() {
  const stats = await apiGet<TimeseriesStats>("/timeseries/stats")
  const statsData = dataOr(stats, {
    db_path: "-",
    ingest_enabled: false,
    ingest_interval_s: 0,
    ingest_tail: 0,
    total_rows: 0,
    first_capture: null,
    last_capture: null,
    distinct_groups: 0,
    distinct_sensors: 0,
  })

  const since = buildRecentWindowSince(statsData.last_capture)
  const sinceQuery = since ? `&since=${encodeURIComponent(since)}` : ""

  const [metrics, delaySeries, throughputSeries, jitterSeries, traffic, latestSnapshots] =
    await Promise.all([
      apiGet<TimeseriesMetricsResponse>("/timeseries/metrics"),
      apiGet<TimeseriesSeries>(`/timeseries/series?metric=avg_delay_ms${sinceQuery}`),
      apiGet<TimeseriesSeries>(`/timeseries/series?metric=throughput_bps${sinceQuery}`),
      apiGet<TimeseriesSeries>(`/timeseries/series?metric=jitter_ms${sinceQuery}`),
      apiGet<TrafficMetrics>("/metrics/traffic?tail=1000"),
      apiGet<SensorMetricsSnapshot[]>("/timeseries/sensors/latest"),
    ])

  const metricsData = dataOr(metrics, { metrics: [] })
  const delayData = buildTrendRows(
    dataOr(delaySeries, { metric: "", since: null, until: null, series: [] }).series,
    "average"
  )
  const throughputData = buildTrendRows(
    dataOr(throughputSeries, { metric: "", since: null, until: null, series: [] }).series,
    "sum"
  )
  const jitterData = buildTrendRows(
    dataOr(jitterSeries, { metric: "", since: null, until: null, series: [] }).series,
    "average"
  )
  const trafficData = buildTrafficSlices(
    dataOr(traffic, {
      source: "",
      parsed_lines: 0,
      ignored_lines: 0,
      groups: {},
    })
  )
  const healthData = buildHealthSlices(dataOr(latestSnapshots, []))
  const trafficRadarGroups = buildTrafficRadarGroups(
    dataOr(traffic, {
      source: "",
      parsed_lines: 0,
      ignored_lines: 0,
      groups: {},
    })
  )

  const totalBytes = trafficData.reduce((sum, slice) => sum + slice.value, 0)
  const totalSensors = healthData.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <section className="space-y-4">
      {[stats, metrics, delaySeries, throughputSeries, jitterSeries, traffic, latestSnapshots]
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`monitoring-${index}`} result={result} />
        ))}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Monitoramento Temporal</h2>
          <p className="text-sm text-muted-foreground">
            Snapshots persistidos em SQLite e recalculados pelos novos cenarios e politicas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" size="sm">
            {statsData.total_rows} snapshots
          </Badge>
          <Badge variant="outline" size="sm">
            {statsData.distinct_groups} grupos
          </Badge>
          <Badge variant="outline" size="sm">
            {metricsData.metrics.length} metricas
          </Badge>
          <Badge variant="outline" size="sm">
            {statsData.distinct_sensors} sensores
          </Badge>
          <Badge variant="outline" size="sm">
            Ultima captura {formatDateTime(statsData.last_capture)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MonitoringAreaChart
          title="Atraso medio por grupo"
          description={`Janela movel de ${RECENT_WINDOW_MINUTES} minutos de avg_delay_ms agregada por grupo a partir do banco SQLite.`}
          badgeLabel="avg_delay_ms"
          badgeVariant="warning-light"
          data={delayData}
          valueLabel="atraso medio"
          valueFormat="ms"
          variant="pattern"
        />
        <MonitoringAreaChart
          title="Vazao por grupo"
          description={`Janela movel de ${RECENT_WINDOW_MINUTES} minutos de throughput_bps somada por grupo para medir a vazao total.`}
          badgeLabel="throughput_bps"
          badgeVariant="info-light"
          data={throughputData}
          valueLabel="vazao"
          valueFormat="bps"
          variant="glow"
        />
        <MonitoringJitterChart
          title="Jitter por grupo"
          description={`Janela movel de ${RECENT_WINDOW_MINUTES} minutos de jitter_ms medio por grupo com leitura mais destacada para picos de instabilidade.`}
          badgeLabel="jitter_ms"
          badgeVariant="warning-light"
          data={jitterData}
        />
        <MonitoringDonutChart
          title="Distribuicao de bytes por grupo"
          description="Participacao atual de cada grupo na massa de trafego armazenada no banco."
          badgeLabel="bytes"
          badgeVariant="success-light"
          data={trafficData}
          centerValue={formatBytes(totalBytes)}
          centerCaption="bytes totais"
          variant="gradient"
        />
        <MonitoringDonutChart
          title="Estado dos sensores"
          description="Classificacao do ultimo snapshot com base em atraso, jitter e perda."
          badgeLabel="snapshot atual"
          badgeVariant="destructive-light"
          data={healthData}
          centerValue={formatNumber(totalSensors)}
          centerCaption="sensores"
          variant="pattern"
          patternKeys={["warning", "critical"]}
        />
        <MonitoringTrafficRadarGrid
          title="Atributos de trafego por grupo"
          description="Radar charts no padrao do c-chart-24 usando /metrics/traffic. Cada grupo mostra perda, msgs/s, vazao, delay e faltantes com valores reais no tooltip."
          groups={trafficRadarGroups}
        />
      </div>
    </section>
  )
}
