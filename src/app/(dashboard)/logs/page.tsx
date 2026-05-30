import { Suspense } from "react"

import { LogsBlock } from "@/components/logs/logs-block"
import { ApiNotice } from "@/components/shared/api-notice"
import { LogsSkeleton } from "@/components/shared/page-skeletons"
import { apiGet, dataOr } from "@/lib/api/server"
import type { GroupName, LogsResponse } from "@/lib/api/types"

const groups: GroupName[] = ["uti", "enfermaria", "triagem"]

export default function LogsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Suspense fallback={<LogsSkeleton columns={1} />}>
        <ServerLogsSection />
      </Suspense>

      <Suspense fallback={<LogsSkeleton columns={3} />}>
        <GroupLogsSection />
      </Suspense>
    </div>
  )
}

async function ServerLogsSection() {
  const serverLogs = await apiGet<LogsResponse>("/logs/server?tail=120")

  return (
    <>
      {!serverLogs.ok ? <ApiNotice result={serverLogs} /> : null}
      <LogsBlock
        title="Servidor Hospitalar"
        logs={dataOr(serverLogs, { logs: "" }).logs}
      />
    </>
  )
}

async function GroupLogsSection() {
  const groupLogs = await Promise.all(
    groups.map((group) => apiGet<LogsResponse>(`/groups/${group}/logs?tail=80`))
  )

  return (
    <>
      {groupLogs
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={`group-logs-${index}`} result={result} />
        ))}
      <div className="grid gap-4 xl:grid-cols-3">
        {groups.map((group, index) => (
          <LogsBlock
            key={group}
            title={group}
            logs={dataOr(groupLogs[index], { logs: [] }).logs}
            compact
          />
        ))}
      </div>
    </>
  )
}
