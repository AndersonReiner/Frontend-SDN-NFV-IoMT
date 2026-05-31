import { Suspense } from "react"

import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh"
import { SensorMetricsGrid } from "@/components/sensors/sensor-metrics-grid"
import { SensorReadingCards } from "@/components/sensors/sensor-reading-cards"
import { ApiNotice } from "@/components/shared/api-notice"
import {
  CardBlockSkeleton,
  DataGridSkeleton,
  MetricCardsSkeleton,
} from "@/components/shared/page-skeletons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type { SensorMetrics, SensorMetricsCollection } from "@/lib/api/types"

export const unstable_instant = { prefetch: "static" }

function flattenSensors(collection: SensorMetricsCollection): SensorMetrics[] {
  return Object.values(collection.groups).flatMap((group) =>
    Object.values(group ?? {})
  )
}

export default function SensorsPage() {
  return (
    <>
      <DashboardAutoRefresh intervalMs={5000} />
      <Suspense
        fallback={
          <div className="space-y-4 md:space-y-6">
            <MetricCardsSkeleton count={3} />
            <CardBlockSkeleton titleWidth="w-56" rows={6} />
            <DataGridSkeleton titleWidth="w-52" columns={8} rows={5} />
          </div>
        }
      >
        <SensorsContent />
      </Suspense>
    </>
  )
}

async function SensorsContent() {
  const sensors = await apiGet<SensorMetricsCollection>("/sensors/metrics?tail=1000")
  const rows = flattenSensors(
    dataOr(sensors, {
      source: "",
      parsed_lines: 0,
      ignored_lines: 0,
      groups: {},
    })
  )

  return (
    <>
      {!sensors.ok ? <ApiNotice result={sensors} /> : null}
      <SensorReadingCards sensors={rows} />
      <Card>
        <CardHeader>
          <CardTitle>Metricas por Sensor Clinico</CardTitle>
        </CardHeader>
        <CardContent>
          <SensorMetricsGrid sensors={rows} />
        </CardContent>
      </Card>
    </>
  )
}
