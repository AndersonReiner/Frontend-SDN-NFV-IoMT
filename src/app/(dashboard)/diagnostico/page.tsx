import { Suspense } from "react"
import { ExternalLinkIcon } from "lucide-react"

import { GatewayCommandCard } from "@/components/gateways/gateway-command-card"
import { ApiNotice } from "@/components/shared/api-notice"
import {
  CardBlockSkeleton,
} from "@/components/shared/page-skeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet, dataOr } from "@/lib/api/server"
import type { ContainerInfo, GroupName, GroupRoutes } from "@/lib/api/types"

export const unstable_instant = { prefetch: "static" }

const groups: GroupName[] = ["uti", "enfermaria", "triagem"]

export default function DiagnosticsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <DiagnosticsHeader />

      <Suspense fallback={<CardBlockSkeleton titleWidth="w-28" rows={8} />}>
        <DiagnosticsContainersSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-4 xl:grid-cols-2">
            <CardBlockSkeleton titleWidth="w-36" rows={5} />
            <CardBlockSkeleton titleWidth="w-36" rows={5} />
            <CardBlockSkeleton titleWidth="w-36" rows={5} />
          </div>
        }
      >
        <DiagnosticsRoutesSection />
      </Suspense>
    </div>
  )
}

function DiagnosticsHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Diagnostico</h1>
        <p className="text-sm text-muted-foreground">
          Inventario Docker, rotas e saidas operacionais da simulacao.
        </p>
      </div>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href="http://localhost:8000/docs" target="_blank" />}
      >
        Swagger
        <ExternalLinkIcon />
      </Button>
    </div>
  )
}

async function DiagnosticsContainersSection() {
  const containers = await apiGet<ContainerInfo[]>("/containers")

  return (
    <>
      {!containers.ok ? <ApiNotice result={containers} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {dataOr(containers, []).map((container) => (
              <div key={container.id} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{container.name}</div>
                <div className="text-muted-foreground">{container.service}</div>
                <div className="mt-2 truncate text-xs text-muted-foreground">
                  {container.image}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

async function DiagnosticsRoutesSection() {
  const routes = await Promise.all(
    groups.map((group) => apiGet<GroupRoutes>(`/groups/${group}/routes`))
  )

  return (
    <>
      {routes
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`diagnostic-routes-${index}`} result={result} />
        ))}
      <div className="grid gap-4 xl:grid-cols-2">
        {routes
          .filter((result) => result.ok)
          .map((result) => (
            <GatewayCommandCard
              key={result.data.group}
              title={`Rotas ${result.data.group}`}
              result={result.data.gateway}
            />
          ))}
      </div>
    </>
  )
}
