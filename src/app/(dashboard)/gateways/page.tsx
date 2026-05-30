export const unstable_instant = { prefetch: "static" }

import { Suspense } from "react"

import { GatewayCommandCard } from "@/components/gateways/gateway-command-card"
import { GatewaySummaryTable } from "@/components/gateways/gateway-summary-table"
import { ApiNotice } from "@/components/shared/api-notice"
import {
  CardBlockSkeleton,
  DataGridSkeleton,
} from "@/components/shared/page-skeletons"
import { apiGet, dataOr } from "@/lib/api/server"
import type { CommandResult, GatewayStatus, GroupName } from "@/lib/api/types"

const groups: GroupName[] = ["uti", "enfermaria", "triagem"]

export default function GatewaysPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Suspense fallback={<DataGridSkeleton titleWidth="w-36" columns={5} rows={4} />}>
        <GatewaysSummarySection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-4 xl:grid-cols-2">
            <CardBlockSkeleton titleWidth="w-52" rows={5} />
            <CardBlockSkeleton titleWidth="w-52" rows={5} />
            <CardBlockSkeleton titleWidth="w-52" rows={5} />
            <CardBlockSkeleton titleWidth="w-52" rows={5} />
          </div>
        }
      >
        <GatewayCommandsSection />
      </Suspense>
    </div>
  )
}

async function GatewaysSummarySection() {
  const gateways = await apiGet<Record<string, GatewayStatus>>("/gateways")
  const gatewayData = Object.values(dataOr(gateways, {}))

  return (
    <>
      {!gateways.ok ? <ApiNotice result={gateways} /> : null}
      <GatewaySummaryTable gateways={gatewayData} />
    </>
  )
}

async function GatewayCommandsSection() {
  const commands = await Promise.all(
    groups.flatMap((group) => [
      apiGet<CommandResult>(`/groups/${group}/gateway/interfaces`),
      apiGet<CommandResult>(`/groups/${group}/gateway/tc`),
      apiGet<CommandResult>(`/groups/${group}/gateway/iptables`),
    ])
  )

  const commandResults = commands
    .filter((result) => result.ok)
    .map((result) => result.data)

  return (
    <>
      {commands
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`gateway-command-${index}`} result={result} />
        ))}
      <div className="grid gap-4 xl:grid-cols-2">
        {commandResults.map((result) => (
          <GatewayCommandCard
            key={`${result.container}-${result.command.join("-")}`}
            title={`${result.container}: ${result.command.join(" ")}`}
            result={result}
          />
        ))}
      </div>
    </>
  )
}
