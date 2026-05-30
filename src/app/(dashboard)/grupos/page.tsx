import Link from "next/link"
import { Suspense } from "react"

import { GROUPS, groupLabel } from "@/config/groups"
import { ApiNotice } from "@/components/shared/api-notice"
import { CardBlockSkeleton } from "@/components/shared/page-skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type {
  GroupInfo,
  GroupMetrics,
  SensorMetricsCollection,
} from "@/lib/api/types"
import { formatBits, formatMs, formatNumber, formatPercent } from "@/lib/format"

export const unstable_instant = { prefetch: "static" }

export default function GroupsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 lg:grid-cols-3">
          <CardBlockSkeleton titleWidth="w-28" rows={5} />
          <CardBlockSkeleton titleWidth="w-28" rows={5} />
          <CardBlockSkeleton titleWidth="w-28" rows={5} />
        </div>
      }
    >
      <GroupsGridSection />
    </Suspense>
  )
}

async function GroupsGridSection() {
  const [groups, sensors, traffic] = await Promise.all([
    apiGet<GroupInfo[]>("/groups"),
    apiGet<Record<string, string[]>>("/sensors"),
    apiGet<SensorMetricsCollection>("/sensors/metrics?tail=1000"),
  ])

  const groupData = dataOr(groups, [])
  const containerSensors = dataOr(sensors, {})
  const clinicalSensors = dataOr(traffic, {
    source: "",
    parsed_lines: 0,
    ignored_lines: 0,
    groups: {},
  })

  return (
    <>
      {[groups, sensors, traffic]
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`groups-${index}`} result={result} />
        ))}

      <div className="grid gap-4 lg:grid-cols-3">
        {groupData.map((group) => {
          const meta = GROUPS[group.group]
          const metrics = Object.values(
            clinicalSensors.groups[group.group] ?? {}
          )
          return (
            <Card key={group.group}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{groupLabel(group.group)}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meta.network} via {group.gateway}
                    </p>
                  </div>
                  <Badge className={meta.color} variant="outline">
                    {metrics.length} sensores
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    Containers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(containerSensors[group.group] ?? group.sensors).map((sensor) => (
                      <Badge key={sensor} variant="outline">
                        {sensor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    Sensores clinicos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metrics.map((metric) => (
                      <Badge key={metric.sensor} variant="secondary">
                        {metric.sensor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/grupos/${group.group}`} />}
                >
                  Ver grupo
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

export function GroupMetricsSummary({ metrics }: { metrics: GroupMetrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div>Mensagens: {formatNumber(metrics.messages)}</div>
      <div>Vazao: {formatBits(metrics.throughput_bps)}</div>
      <div>Delay: {formatMs(metrics.avg_delay_ms)}</div>
      <div>Perda: {formatPercent(metrics.packet_loss_percent)}</div>
    </div>
  )
}
