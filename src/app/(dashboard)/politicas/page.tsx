export const unstable_instant = { prefetch: "static" }

import { Suspense } from "react"

import { PolicyActions } from "@/components/policies/policy-actions"
import { ApiNotice } from "@/components/shared/api-notice"
import { CardBlockSkeleton } from "@/components/shared/page-skeletons"
import { apiGet, dataOr } from "@/lib/api/server"
import type { GatewayStatus, PoliciesResponse } from "@/lib/api/types"

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <CardBlockSkeleton titleWidth="w-44" rows={6} />
          <CardBlockSkeleton titleWidth="w-40" rows={5} />
        </div>
      }
    >
      <PoliciesContent />
    </Suspense>
  )
}

async function PoliciesContent() {
  const [policies, gateways] = await Promise.all([
    apiGet<PoliciesResponse>("/policies"),
    apiGet<Record<string, GatewayStatus>>("/gateways"),
  ])

  return (
    <>
      {[policies, gateways]
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={index} result={result} />
        ))}
      <PolicyActions
        policies={Object.values(dataOr(policies, {}))}
        gateways={Object.values(dataOr(gateways, {}))}
      />
    </>
  )
}
