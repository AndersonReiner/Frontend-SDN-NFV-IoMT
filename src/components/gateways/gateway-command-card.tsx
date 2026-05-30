import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import type { CommandResult } from "@/lib/api/types"

export function GatewayCommandCard({
  title,
  result,
  compact = false,
}: {
  title: string
  result: CommandResult
  compact?: boolean
}) {
  const content = (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusBadge tone={result.exit_code === 0 ? "success" : "danger"}>
          exit {result.exit_code}
        </StatusBadge>
        <span>{result.command.join(" ")}</span>
      </div>
      <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90">
        {result.output || "(sem saida)"}
      </pre>
    </>
  )

  if (compact) {
    return <div className="rounded-lg border p-3">{content}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
