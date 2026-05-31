import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Bloco reutilizavel para renderizar logs textuais em formato monoespacado.
 */
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
              ? "max-h-80 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90"
              : "max-h-[520px] overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed text-foreground/90"
          }
        >
          {text || "(sem logs)"}
        </pre>
      </CardContent>
    </Card>
  )
}
