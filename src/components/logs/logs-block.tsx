import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LogsBlock({
  title,
  logs,
  compact = false,
}: {
  title: string
  logs: string | string[]
  compact?: boolean
}) {
  const text = Array.isArray(logs) ? logs.join("\n") : logs

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre
          className={
            compact
              ? "max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"
              : "max-h-[520px] overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed"
          }
        >
          {text || "(sem logs)"}
        </pre>
      </CardContent>
    </Card>
  )
}
