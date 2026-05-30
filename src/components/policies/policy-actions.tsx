"use client"

import * as React from "react"
import { ShieldCheckIcon, ShieldOffIcon } from "lucide-react"

import { groupLabel } from "@/config/groups"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  CommandResult,
  GatewayStatus,
  PolicyEndpoint,
} from "@/lib/api/types"

export function PolicyActions({
  policies,
  gateways,
}: {
  policies: PolicyEndpoint[]
  gateways: GatewayStatus[]
}) {
  const [pending, setPending] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<unknown>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function execute(policy: PolicyEndpoint) {
    setPending(policy.key)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`/api/backend${policy.path}`, {
        method: policy.method,
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body?.detail ?? `HTTP ${response.status}`)
      } else {
        setResult(body)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao executar politica")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Politicas VNF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            O backend exposto hoje permite atuar apenas em politicas por grupo e gateway.
            Nao existe endpoint para desativar sensor ou dispositivo individualmente.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
          {policies.map((policy) => (
            <div key={policy.key} className="rounded-lg border p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{policy.key}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {policy.description}
                  </p>
                </div>
                <Badge variant="outline">{policy.method}</Badge>
              </div>
              <Button
                variant={policy.action.includes("restore") ? "outline" : "default"}
                disabled={pending !== null}
                onClick={() => execute(policy)}
              >
                {policy.action.includes("block") ? <ShieldOffIcon /> : <ShieldCheckIcon />}
                {pending === policy.key ? "Executando..." : "Executar"}
              </Button>
            </div>
          ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gateways.map((gateway) => (
              <div key={gateway.container} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{groupLabel(gateway.group)}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    banda: {gateway.policies.bandwidth_limit_active ? "limitada" : "normal"}
                  </Badge>
                  <Badge variant="outline">
                    triagem: {gateway.policies.triage_block_active ? "bloqueada" : "liberada"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {result ? <PolicyResult result={result} /> : null}
      </div>
    </div>
  )
}

function PolicyResult({ result }: { result: unknown }) {
  const commandResults = normalizeResult(result)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ultimo Resultado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {commandResults.map((item) => (
          <div key={`${item.container}-${item.command.join("-")}`} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Badge variant={item.exit_code === 0 ? "secondary" : "destructive"}>
                exit {item.exit_code}
              </Badge>
              <span>{item.container}</span>
            </div>
            <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
              {item.output || "(sem saida)"}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function normalizeResult(result: unknown): CommandResult[] {
  if (isCommandResult(result)) return [result]
  if (result && typeof result === "object") {
    return Object.values(result).filter(isCommandResult)
  }
  return []
}

function isCommandResult(value: unknown): value is CommandResult {
  return (
    value !== null &&
    typeof value === "object" &&
    "container" in value &&
    "command" in value &&
    "exit_code" in value &&
    "output" in value
  )
}
