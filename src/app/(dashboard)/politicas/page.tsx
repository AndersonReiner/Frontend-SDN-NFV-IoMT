import { PolicyActions } from "@/components/policies/policy-actions"
import { ApiNotice } from "@/components/shared/api-notice"
import { apiGet, dataOr } from "@/lib/api/server"
import type { GatewayStatus, PoliciesResponse } from "@/lib/api/types"

export default async function PoliciesPage() {
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
