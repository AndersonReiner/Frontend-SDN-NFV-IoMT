export const unstable_instant = { prefetch: "static" }

import { Suspense } from "react"

import { PolicyActions } from "@/components/policies/policy-actions"
import { ApiNotice } from "@/components/shared/api-notice"
import { CardBlockSkeleton } from "@/components/shared/page-skeletons"
import { apiGet, dataOr } from "@/lib/api/server"
import { groupLabel } from "@/config/groups"
import type {
  GatewayStatus,
  OpenApiSpec,
  PolicyFamily,
  PolicyRouteDraft,
  PolicyRoute,
  PoliciesResponse,
} from "@/lib/api/types"

/**
 * Pagina operacional para descoberta e execucao das politicas de rede.
 */
export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <CardBlockSkeleton titleWidth="w-44" rows={6} />
          <CardBlockSkeleton titleWidth="w-40" rows={8} />
        </div>
      }
    >
      <PoliciesContent />
    </Suspense>
  )
}

/**
 * Carrega as politicas fixas, o estado dos gateways e o contrato OpenAPI vivo.
 */
async function PoliciesContent() {
  const [policies, gateways, openapi] = await Promise.all([
    apiGet<PoliciesResponse>("/policies"),
    apiGet<Record<string, GatewayStatus>>("/gateways"),
    apiGet<OpenApiSpec>("/openapi.json"),
  ])

  const fixedPolicies = Object.values(dataOr(policies, {}))
  const gatewayMap = dataOr(gateways, {})
  const runtimeFamilies = buildPolicyFamilies(
    dataOr(openapi, { paths: {} } as OpenApiSpec),
    gatewayMap
  )

  return (
    <>
      {[policies, gateways, openapi]
        .filter((result) => !result.ok)
        .map((result, index) => (
          <ApiNotice key={index} result={result} />
        ))}
      <PolicyActions
        fixedPolicies={fixedPolicies}
        runtimeFamilies={runtimeFamilies}
        gateways={Object.values(dataOr(gateways, {}))}
      />
    </>
  )
}

const GROUPS = ["uti", "enfermaria", "triagem"] as const

/**
 * Constrói familias de politicas dinamicas por grupo a partir do OpenAPI ativo.
 */
function buildPolicyFamilies(
  spec: OpenApiSpec,
  gateways: Record<string, GatewayStatus>
): PolicyFamily[] {
  return GROUPS.flatMap((group) => {
    const gateway = gateways[group]
    const currentPolicyState = gateway?.policies ?? {
      bandwidth_limit_active: false,
      triage_block_active: false,
      network_emulation_active: false,
    }

    return [
      buildLimitFamily(spec, group, currentPolicyState),
      buildNetemFamily(spec, group, currentPolicyState),
    ].filter((family): family is PolicyFamily => family !== null)
  })
}

/**
 * Gera a familia de limitacao de banda quando as rotas TBF estao disponiveis.
 */
function buildLimitFamily(
  spec: OpenApiSpec,
  group: (typeof GROUPS)[number],
  current_policy_state: PolicyFamily["current_policy_state"]
): PolicyFamily | null {
  if (!spec.paths["/policies/{group}/limit"]?.post) return null
  if (!spec.paths["/policies/{group}/limit/clear"]?.post) return null

  return {
    group,
    title: `${groupLabel(group)} - Limite de banda`,
    description: "Ajusta o TBF do gateway com rate, burst e latency.",
    current_policy_state,
    apply: buildPolicyRoute({
      group,
      action: "limit",
      title: "Aplicar limitacao",
      description: "Configura a limitacao de banda para o grupo.",
      path: `/policies/${group}/limit`,
      body_kind: "tbf",
      status_endpoint: "/gateways",
      body_defaults: {
        rate: "256kbit",
        burst: "32kbit",
        latency: "400ms",
      },
    }),
    clear: buildPolicyRoute({
      group,
      action: "limit_clear",
      title: "Limpar limitacao",
      description: "Remove a limitacao de banda do grupo.",
      path: `/policies/${group}/limit/clear`,
      body_kind: null,
      status_endpoint: "/gateways",
      body_defaults: null,
    }),
  }
}

/**
 * Gera a familia de emulacao de rede quando as rotas netem estao disponiveis.
 */
function buildNetemFamily(
  spec: OpenApiSpec,
  group: (typeof GROUPS)[number],
  current_policy_state: PolicyFamily["current_policy_state"]
): PolicyFamily | null {
  if (!spec.paths["/policies/{group}/netem"]?.post) return null
  if (!spec.paths["/policies/{group}/netem/clear"]?.post) return null

  return {
    group,
    title: `${groupLabel(group)} - Emulacao de rede`,
    description: "Ajusta delay, jitter, perda, duplicacao e reorder.",
    current_policy_state,
    apply: buildPolicyRoute({
      group,
      action: "netem",
      title: "Aplicar netem",
      description: "Configura a degradacao de rede do grupo.",
      path: `/policies/${group}/netem`,
      body_kind: "netem",
      status_endpoint: "/gateways",
      body_defaults: {
        delay_ms: 0,
        jitter_ms: 0,
        loss_pct: 0,
        duplicate_pct: 0,
        corrupt_pct: 0,
        reorder_pct: 0,
      },
    }),
    clear: buildPolicyRoute({
      group,
      action: "netem_clear",
      title: "Limpar netem",
      description: "Remove a emulacao de rede do grupo.",
      path: `/policies/${group}/netem/clear`,
      body_kind: null,
      status_endpoint: "/gateways",
      body_defaults: null,
    }),
  }
}

/**
 * Finaliza uma rota de politica com metadados padrao usados pela interface.
 */
function buildPolicyRoute(route: PolicyRouteDraft): PolicyRoute {
  return {
    ...route,
    key: `${route.group}-${route.action}`,
    method: "POST",
    request_body_required: route.body_kind !== null,
    body_defaults: route.body_defaults,
  }
}
