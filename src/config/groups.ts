import type { GroupName } from "@/lib/api/types"

export const GROUPS: Record<
  GroupName,
  {
    label: string
    network: string
    gateway: string
    color: string
    chartColor: string
  }
> = {
  uti: {
    label: "UTI",
    network: "10.0.1.0/24",
    gateway: "gw-uti",
    color: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-900",
    chartColor: "var(--chart-1)",
  },
  enfermaria: {
    label: "Enfermaria",
    network: "10.0.2.0/24",
    gateway: "gw-enfermaria",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900",
    chartColor: "var(--chart-2)",
  },
  triagem: {
    label: "Triagem",
    network: "10.0.3.0/24",
    gateway: "gw-triagem",
    color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/30 dark:border-blue-900",
    chartColor: "var(--chart-3)",
  },
}

export function groupLabel(group: string) {
  return GROUPS[group as GroupName]?.label ?? group
}
