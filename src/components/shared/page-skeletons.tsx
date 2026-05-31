import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder para grades de KPIs no topo das paginas.
 */
export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="size-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Placeholder generico para cards em bloco com lista interna.
 */
export function CardBlockSkeleton({
  titleWidth = "w-40",
  rows = 5,
}: {
  titleWidth?: string
  rows?: number
}) {
  return (
    <div className="rounded-xl border">
      <div className="space-y-3 border-b px-6 py-5">
        <Skeleton className={`h-5 ${titleWidth}`} />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Placeholder para um grafico simples de barras ou serie temporal.
 */
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border p-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mt-6 grid h-72 grid-cols-12 items-end gap-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton
            key={index}
            className="w-full rounded-sm"
            style={{
              height: `${40 + ((index * 17) % 120)}px`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Placeholder para a secao composta de monitoramento do dashboard.
 */
export function MonitoringChartsSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl border p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="h-[220px] w-full rounded-lg" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Placeholder para tabelas e data grids paginados.
 */
export function DataGridSkeleton({
  titleWidth = "w-44",
  columns = 7,
  rows = 6,
}: {
  titleWidth?: string
  columns?: number
  rows?: number
}) {
  return (
    <div className="rounded-xl border">
      <div className="space-y-3 border-b px-6 py-5">
        <Skeleton className={`h-5 ${titleWidth}`} />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid gap-3 border-b bg-muted/30 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-16" />
            ))}
          </div>
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-3 px-4 py-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={colIndex === 1 ? "h-4 w-24" : "h-4 w-full"}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  )
}

/**
 * Placeholder para cards de logs textuais.
 */
export function LogsSkeleton({ columns = 1 }: { columns?: number }) {
  return (
    <div
      className={`grid gap-4 ${columns > 1 ? "xl:grid-cols-3" : ""}`}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="rounded-xl border">
          <div className="space-y-3 border-b px-6 py-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-3 p-6">
            {Array.from({ length: 10 }).map((__, lineIndex) => (
              <Skeleton
                key={lineIndex}
                className={`h-4 ${lineIndex % 3 === 0 ? "w-full" : lineIndex % 3 === 1 ? "w-5/6" : "w-2/3"}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Placeholder para cabecalhos de paginas de detalhe.
 */
export function DetailHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  )
}

/**
 * Estrutura de loading da home operacional do dashboard.
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <MetricCardsSkeleton />
      <ChartSkeleton />
      <MonitoringChartsSkeleton />
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <DataGridSkeleton titleWidth="w-40" columns={8} rows={5} />
        <CardBlockSkeleton titleWidth="w-36" rows={6} />
      </div>
      <CardBlockSkeleton titleWidth="w-48" rows={8} />
    </div>
  )
}

/**
 * Estrutura de loading usada nas demais paginas de detalhe.
 */
export function GenericPageLoadingSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <DetailHeaderSkeleton />
      <MetricCardsSkeleton />
      <div className="grid gap-4 xl:grid-cols-2">
        <CardBlockSkeleton />
        <CardBlockSkeleton titleWidth="w-52" />
      </div>
      <DataGridSkeleton />
    </div>
  )
}
