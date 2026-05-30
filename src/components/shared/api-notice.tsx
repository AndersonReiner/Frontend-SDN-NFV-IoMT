import type { ApiResult } from "@/lib/api/types"

export function ApiNotice<T>({ result }: { result: ApiResult<T> }) {
  if (result.ok) return null

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <div className="font-medium">Falha ao consultar o backend</div>
      <div>{result.message}</div>
    </div>
  )
}
