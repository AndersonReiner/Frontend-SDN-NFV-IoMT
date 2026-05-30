import Link from "next/link"

import { GROUPS, groupLabel } from "@/config/groups"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorMetrics } from "@/lib/api/types"
import { formatDateTime, formatReading } from "@/lib/format"

export function SensorReadingCards({ sensors }: { sensors: SensorMetrics[] }) {
  const latest = [...sensors]
    .sort((a, b) => (b.last_seen ?? "").localeCompare(a.last_seen ?? ""))
    .slice(0, 6)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {latest.map((sensor) => (
        <Card key={`${sensor.group}-${sensor.sensor}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{sensor.sensor}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(sensor.last_seen)}
                </p>
              </div>
              <Badge className={GROUPS[sensor.group].color} variant="outline">
                {groupLabel(sensor.group)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              {formatReading(sensor.last_reading)}
            </div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/sensores/${sensor.group}/${sensor.sensor}`} />}
            >
              Detalhar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
