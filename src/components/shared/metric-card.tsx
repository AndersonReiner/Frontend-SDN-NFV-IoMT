import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}: {
  title: string
  value: string
  description: string
  icon: LucideIcon
  tone?: "neutral" | "success" | "warning" | "danger"
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardDescription>{title}</CardDescription>
          <div
            className={cn(
              "rounded-md border p-1.5",
              tone === "success" &&
                "border-success/30 bg-success/10 text-success-foreground",
              tone === "warning" &&
                "border-warning/30 bg-warning/10 text-warning-foreground",
              tone === "danger" &&
                "border-destructive/30 bg-destructive/10 text-destructive",
              tone === "neutral" && "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  )
}
