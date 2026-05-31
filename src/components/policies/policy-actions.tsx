"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  ActivityIcon,
  PlayIcon,
  RefreshCwIcon,
  ServerIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { GROUPS, groupLabel } from "@/config/groups"
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  CommandResult,
  GatewayStatus,
  GroupName,
  PolicyEndpoint,
  PolicyFamily,
  PolicyRoute,
} from "@/lib/api/types"
import { formatNumber } from "@/lib/format"

type ExecutionRoute = PolicyRoute

type BodyDraft = Record<string, string>
type FixedPolicyRow = PolicyEndpoint
type RuntimePolicyRow = {
  key: string
  group: GroupName
  title: string
  description: string
  kind: "tbf" | "netem"
  apply: PolicyRoute
  clear: PolicyRoute
  active: boolean
  parameterSummary: string
}

const FIXED_ORDER = [
  "enfermaria_limit",
  "enfermaria_restore",
  "triagem_block",
  "triagem_unblock",
  "restore_all",
]

const TBF_DEFAULTS = {
  rate: "256kbit",
  burst: "32kbit",
  latency: "400ms",
}

const NETEM_DEFAULTS = {
  delay_ms: "0",
  jitter_ms: "0",
  loss_pct: "0",
  duplicate_pct: "0",
  corrupt_pct: "0",
  reorder_pct: "0",
}

const GROUP_ORDER: GroupName[] = ["uti", "enfermaria", "triagem"]

export function PolicyActions({
  fixedPolicies,
  runtimeFamilies,
  gateways,
}: {
  fixedPolicies: PolicyEndpoint[]
  runtimeFamilies: PolicyFamily[]
  gateways: GatewayStatus[]
}) {
  const router = useRouter()
  const [pendingKey, setPendingKey] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<unknown>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedRoute, setSelectedRoute] = React.useState<ExecutionRoute | null>(null)
  const [draft, setDraft] = React.useState<BodyDraft>({})

  const fixedRows = React.useMemo(() => {
    const order = new Map(FIXED_ORDER.map((key, index) => [key, index]))
    return [...fixedPolicies].sort((a, b) => {
      const aIndex = order.get(a.key) ?? FIXED_ORDER.length
      const bIndex = order.get(b.key) ?? FIXED_ORDER.length
      return aIndex - bIndex
    })
  }, [fixedPolicies])

  const runtimeByGroup = React.useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      families: runtimeFamilies.filter((family) => family.group === group),
    }))
  }, [runtimeFamilies])
  const gatewayByGroup = React.useMemo(() => {
    return Object.fromEntries(gateways.map((gateway) => [gateway.group, gateway]))
  }, [gateways])

  const runtimeRows = React.useMemo<RuntimePolicyRow[]>(() => {
    return runtimeByGroup.flatMap(({ group, families }) => {
      const gateway = gatewayByGroup[group]

      return families.map((family) => ({
        key: `${family.group}-${family.apply.action}`,
        group,
        title: family.title,
        description: family.description,
        kind: family.apply.body_kind === "tbf" ? "tbf" : "netem",
        apply: family.apply,
        clear: family.clear,
        active:
          family.apply.body_kind === "tbf"
            ? Boolean(gateway?.policies.bandwidth_limit_active)
            : Boolean(gateway?.policies.network_emulation_active),
        parameterSummary:
          family.apply.body_kind === "tbf"
            ? "rate, burst, latency"
            : "delay, jitter, loss, duplicate, corrupt, reorder",
      }))
    })
  }, [gatewayByGroup, runtimeByGroup])

  const activePolicyCount = React.useMemo(
    () =>
      gateways.reduce((sum, gateway) => {
        return (
          sum +
          Number(gateway.policies.bandwidth_limit_active) +
          Number(gateway.policies.triage_block_active) +
          Number(gateway.policies.network_emulation_active)
        )
      }, 0),
    [gateways]
  )

  async function execute(route: ExecutionRoute, body?: BodyDraft) {
    setPendingKey(route.key)
    setError(null)

    try {
      const payload = buildPayload(route, body)
      const response = await fetch(`/api/backend${route.path}`, {
        method: route.method,
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      })
      const responseBody = await response.json().catch(() => null)

      if (!response.ok) {
        setError(extractError(responseBody, response.status))
      } else {
        setResult(responseBody)
        setDrawerOpen(false)
        setSelectedRoute(null)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao executar politica")
    } finally {
      setPendingKey(null)
    }
  }

  function openDrawer(route: ExecutionRoute) {
    setSelectedRoute(route)
    setDraft(createDraft(route))
    setDrawerOpen(true)
  }

  const summaryCards = [
    {
      title: "Acoes fixas",
      value: fixedRows.length,
      description: "Contrato exposto por GET /policies",
      icon: ShieldCheckIcon,
    },
    {
      title: "Acoes parametrizadas",
      value: runtimeFamilies.length,
      description: "Rotas derivadas do OpenAPI vivo",
      icon: SlidersHorizontalIcon,
    },
    {
      title: "Gateways online",
      value: gateways.filter((gateway) => gateway.running).length,
      description: `${gateways.length} gateways monitorados`,
      icon: ServerIcon,
    },
    {
      title: "Politicas ativas",
      value: activePolicyCount,
      description: "Sinais operacionais atualmente ligados",
      icon: ActivityIcon,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={formatNumber(card.value)}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>

      <Tabs defaultValue="fixed" className="space-y-4">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="fixed">Fixas</TabsTrigger>
          <TabsTrigger value="runtime">Parametrizadas</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-4">
          <PolicyFixedGrid
            pendingKey={pendingKey}
            policies={fixedRows}
            onExecute={(policy) =>
              execute({
                key: policy.key,
                group: policy.group ?? "uti",
                action: normalizeAction(policy.action),
                title: policy.key,
                description: policy.description,
                method: policy.method,
                path: policy.path,
                request_body_required: policy.request_body_required,
                body_kind: null,
                body_defaults: null,
                status_endpoint: policy.status_endpoint,
              })
            }
          />
        </TabsContent>

        <TabsContent value="runtime" className="space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Politicas parametrizadas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Rotas operacionais derivadas do OpenAPI atual, com configuracao
                guiada para <code>/limit</code> e <code>/netem</code> por grupo.
              </p>
            </CardHeader>
            <CardContent>
              <PolicyRuntimeGrid
                pendingKey={pendingKey}
                routes={runtimeRows}
                onConfigure={openDrawer}
                onClear={(route) => execute(route)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive dark:bg-destructive/15">
          {error}
        </div>
      ) : null}

      {result ? <PolicyResult result={result} /> : null}

      <PolicyRouteSheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        route={selectedRoute}
        draft={draft}
        pending={pendingKey !== null}
        onDraftChange={setDraft}
        onSubmit={() => selectedRoute && execute(selectedRoute, draft)}
      />
    </div>
  )
}

function PolicyFixedGrid({
  policies,
  pendingKey,
  onExecute,
}: {
  policies: FixedPolicyRow[]
  pendingKey: string | null
  onExecute: (policy: FixedPolicyRow) => void
}) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "group", desc: false },
  ])

  const columns: ColumnDef<FixedPolicyRow>[] = [
    {
      accessorKey: "key",
      header: "Politica",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{labelFixedPolicy(row.original)}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.description}
          </div>
        </div>
      ),
      size: 360,
    },
    {
      accessorKey: "group",
      header: "Alvo",
      cell: ({ row }) =>
        row.original.group ? (
          <Badge className={GROUPS[row.original.group].color} variant="outline">
            {groupLabel(row.original.group)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Todos os grupos</span>
        ),
      size: 140,
    },
    {
      accessorKey: "path",
      header: "Rota",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-xs">{row.original.path}</code>
      ),
      size: 260,
    },
    {
      accessorKey: "response_model",
      header: "Resposta",
      size: 180,
    },
    {
      id: "action",
      header: "Acao",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant={row.original.action.includes("restore") ? "outline" : "default"}
            disabled={pendingKey !== null}
            onClick={() => onExecute(row.original)}
          >
            {row.original.action.includes("restore") ? (
              <RefreshCwIcon />
            ) : row.original.action.includes("block") ? (
              <ShieldOffIcon />
            ) : (
              <ShieldCheckIcon />
            )}
            {pendingKey === row.original.key ? "Executando..." : "Executar"}
          </Button>
        </div>
      ),
      size: 170,
      meta: {
        headerClassName: "text-right rtl:text-left",
      },
    },
  ]

  const table = useReactTable({
    columns,
    data: policies,
    pageCount: Math.ceil((policies.length || 0) / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Politicas fixas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Rotas diretas de <code>GET /policies</code>, sem configuracao de body.
        </p>
      </CardHeader>
      <CardContent>
        <DataGrid
          table={table}
          recordCount={policies.length}
          tableLayout={{ stripped: true, rowRounded: true }}
        >
          <div className="w-full space-y-2.5">
            <DataGridContainer border={false}>
              <DataGridScrollArea>
                <DataGridTable />
              </DataGridScrollArea>
            </DataGridContainer>
            <DataGridPagination sizes={[5, 10, 20]} />
          </div>
        </DataGrid>
      </CardContent>
    </Card>
  )
}

function PolicyRuntimeGrid({
  routes,
  pendingKey,
  onConfigure,
  onClear,
}: {
  routes: RuntimePolicyRow[]
  pendingKey: string | null
  onConfigure: (route: PolicyRoute) => void
  onClear: (route: PolicyRoute) => void
}) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "group", desc: false },
  ])

  const columns: ColumnDef<RuntimePolicyRow>[] = [
    {
      accessorKey: "group",
      header: "Grupo",
      cell: ({ row }) => (
        <Badge className={GROUPS[row.original.group].color} variant="outline">
          {groupLabel(row.original.group)}
        </Badge>
      ),
      size: 130,
    },
    {
      accessorKey: "title",
      header: "Controle",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.description}
          </div>
        </div>
      ),
      size: 320,
    },
    {
      accessorKey: "kind",
      header: "Tipo",
      cell: ({ row }) => (
        <StatusBadge tone={row.original.kind === "tbf" ? "warning" : "danger"}>
          {row.original.kind === "tbf" ? "tbf" : "netem"}
        </StatusBadge>
      ),
      size: 120,
    },
    {
      accessorKey: "parameterSummary",
      header: "Parametros",
      size: 260,
    },
    {
      accessorKey: "active",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge tone={row.original.active ? "warning" : "success"}>
          {row.original.active ? "ativo" : "inativo"}
        </StatusBadge>
      ),
      size: 120,
    },
    {
      accessorKey: "apply.path",
      header: "Rotas",
      cell: ({ row }) => (
        <div className="space-y-1">
          <code className="block rounded bg-muted px-2 py-1 text-xs">
            {row.original.apply.path}
          </code>
          <code className="block rounded bg-muted px-2 py-1 text-xs">
            {row.original.clear.path}
          </code>
        </div>
      ),
      size: 260,
    },
    {
      id: "actions",
      header: "Acoes",
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            disabled={pendingKey !== null}
            onClick={() => onConfigure(row.original.apply)}
          >
            <PlayIcon />
            {pendingKey === row.original.apply.key ? "Executando..." : "Configurar"}
          </Button>
          <Button
            variant="outline"
            disabled={pendingKey !== null}
            onClick={() => onClear(row.original.clear)}
          >
            <Trash2Icon />
            {pendingKey === row.original.clear.key ? "Limpando..." : "Limpar"}
          </Button>
        </div>
      ),
      size: 240,
      meta: {
        headerClassName: "text-right rtl:text-left",
      },
    },
  ]

  const table = useReactTable({
    columns,
    data: routes,
    pageCount: Math.ceil((routes.length || 0) / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={routes.length}
      tableLayout={{ stripped: true, rowRounded: true }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer border={false}>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <DataGridPagination sizes={[5, 10, 20]} />
      </div>
    </DataGrid>
  )
}

function PolicyRouteSheet({
  open,
  onOpenChange,
  route,
  draft,
  pending,
  onDraftChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: ExecutionRoute | null
  draft: BodyDraft
  pending: boolean
  onDraftChange: React.Dispatch<React.SetStateAction<BodyDraft>>
  onSubmit: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle>{route?.title ?? "Executar politica"}</SheetTitle>
          <SheetDescription>
            {route?.description ?? "Escolha os valores e confirme a execucao."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-4 pb-4">
          {route ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <div className="font-medium">{route.path}</div>
                <div className="mt-1 text-muted-foreground">
                  {route.request_body_required
                    ? "Essa rota aceita body configuravel."
                    : "Essa rota nao exige body."}
                </div>
              </div>

              {route.body_kind === "tbf" ? (
                <div className="space-y-3">
                  <Field label="Rate" description="Taxa maxima, ex.: 256kbit, 1mbit.">
                    <Input
                      value={draft.rate ?? TBF_DEFAULTS.rate}
                      onChange={(event) =>
                        onDraftChange((current) => ({
                          ...current,
                          rate: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Burst" description="Burst permitido, ex.: 32kbit.">
                    <Input
                      value={draft.burst ?? TBF_DEFAULTS.burst}
                      onChange={(event) =>
                        onDraftChange((current) => ({
                          ...current,
                          burst: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Latency" description="Latencia maxima, ex.: 400ms.">
                    <Input
                      value={draft.latency ?? TBF_DEFAULTS.latency}
                      onChange={(event) =>
                        onDraftChange((current) => ({
                          ...current,
                          latency: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              ) : null}

              {route.body_kind === "netem" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {NETEM_FIELDS.map((field) => (
                    <Field
                      key={field.key}
                      label={field.label}
                      description={field.description}
                    >
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={draft[field.key] ?? NETEM_DEFAULTS[field.key]}
                        onChange={(event) =>
                          onDraftChange((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                      />
                    </Field>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <SheetFooter className="px-4 pb-4">
          <Button onClick={onSubmit} disabled={pending || !route}>
            <PlayIcon />
            {pending ? "Executando..." : "Executar agora"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function PolicyResult({ result }: { result: unknown }) {
  const commandResults = normalizeResult(result)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ultimo resultado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {commandResults.map((item) => (
          <div
            key={`${item.container}-${item.command.join("-")}`}
            className="rounded-lg border p-3"
          >
            <div className="mb-2 flex items-center gap-2 text-sm">
              <StatusBadge tone={item.exit_code === 0 ? "success" : "danger"}>
                exit {item.exit_code}
              </StatusBadge>
              <span>{item.container}</span>
            </div>
            <pre className="max-h-60 overflow-auto rounded-md border bg-muted/40 p-3 text-xs text-foreground/90">
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

function buildPayload(route: ExecutionRoute, draft?: BodyDraft) {
  if (!route.body_kind || !draft) return undefined

  if (route.body_kind === "tbf") {
    return {
      rate: draft.rate ?? TBF_DEFAULTS.rate,
      burst: draft.burst ?? TBF_DEFAULTS.burst,
      latency: draft.latency ?? TBF_DEFAULTS.latency,
    }
  }

  return {
    delay_ms: Number(draft.delay_ms ?? NETEM_DEFAULTS.delay_ms),
    jitter_ms: Number(draft.jitter_ms ?? NETEM_DEFAULTS.jitter_ms),
    loss_pct: Number(draft.loss_pct ?? NETEM_DEFAULTS.loss_pct),
    duplicate_pct: Number(draft.duplicate_pct ?? NETEM_DEFAULTS.duplicate_pct),
    corrupt_pct: Number(draft.corrupt_pct ?? NETEM_DEFAULTS.corrupt_pct),
    reorder_pct: Number(draft.reorder_pct ?? NETEM_DEFAULTS.reorder_pct),
  }
}

function createDraft(route: ExecutionRoute): BodyDraft {
  if (route.body_kind === "tbf") {
    return { ...TBF_DEFAULTS }
  }

  if (route.body_kind === "netem") {
    return { ...NETEM_DEFAULTS }
  }

  return {}
}

function extractError(body: unknown, status: number) {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail?: unknown }).detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) return detail.map((item) => (item as { msg?: string }).msg).join(", ")
  }

  return `HTTP ${status}`
}

function labelFixedPolicy(policy: PolicyEndpoint) {
  switch (policy.action) {
    case "limit":
      return `${groupLabel(policy.group ?? "uti")} - limitar`
    case "restore":
      return policy.group ? `${groupLabel(policy.group)} - restaurar` : "Restaurar tudo"
    case "block":
      return `${groupLabel(policy.group ?? "triagem")} - bloquear`
    case "unblock":
      return `${groupLabel(policy.group ?? "triagem")} - liberar`
    case "restore_all":
      return "Restaurar tudo"
    default:
      return policy.key
  }
}

function normalizeAction(action: string): PolicyRoute["action"] {
  switch (action) {
    case "limit":
      return "limit"
    case "restore":
      return "limit_clear"
    case "block":
      return "netem"
    case "unblock":
      return "netem_clear"
    case "restore_all":
      return "limit_clear"
    default:
      return "limit"
  }
}

const NETEM_FIELDS = [
  {
    key: "delay_ms",
    label: "Delay",
    description: "Latencia adicional em milissegundos.",
  },
  {
    key: "jitter_ms",
    label: "Jitter",
    description: "Variacao da latencia em milissegundos.",
  },
  {
    key: "loss_pct",
    label: "Loss",
    description: "Percentual de perda de pacotes.",
  },
  {
    key: "duplicate_pct",
    label: "Duplicate",
    description: "Percentual de duplicacao.",
  },
  {
    key: "corrupt_pct",
    label: "Corrupt",
    description: "Percentual de corrupcao.",
  },
  {
    key: "reorder_pct",
    label: "Reorder",
    description: "Percentual de reordenacao.",
  },
] as const
