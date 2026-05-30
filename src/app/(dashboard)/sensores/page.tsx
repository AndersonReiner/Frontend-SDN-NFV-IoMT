import { SensorMetricsGrid } from "@/components/sensors/sensor-metrics-grid"
import { SensorReadingCards } from "@/components/sensors/sensor-reading-cards"
import { ApiNotice } from "@/components/shared/api-notice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type { SensorMetrics, SensorMetricsCollection } from "@/lib/api/types"

function flattenSensors(collection: SensorMetricsCollection): SensorMetrics[] {
  return Object.values(collection.groups).flatMap((group) =>
    Object.values(group ?? {})
  )
}

export default async function SensorsPage() {
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
