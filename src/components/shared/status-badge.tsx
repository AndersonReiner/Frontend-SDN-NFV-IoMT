import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "success" | "warning" | "danger" | "neutral"
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        tone === "success" &&
          "border-success/30 bg-success/10 text-success-foreground",
        tone === "warning" &&
          "border-warning/30 bg-warning/10 text-warning-foreground",
        tone === "danger" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "neutral" && "border-border bg-muted/40 text-foreground"
      )}
    >
      {children}
    </Badge>
  )
}
