import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <Badge variant={result.exit_code === 0 ? "secondary" : "destructive"}>
          exit {result.exit_code}
        </Badge>
        <span>{result.command.join(" ")}</span>
      </div>
      <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
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
