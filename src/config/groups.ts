import type { GroupName } from "@/lib/api/types"

/**
 * Metadados visuais e operacionais utilizados em toda a interface para cada grupo.
 */
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
    color:
      "text-[var(--group-uti-fg)] bg-[var(--group-uti-bg)] border-[var(--group-uti-border)]",
    chartColor: "var(--group-uti-chart)",
  },
  enfermaria: {
    label: "Enfermaria",
    network: "10.0.2.0/24",
    gateway: "gw-enfermaria",
    color:
      "text-[var(--group-enfermaria-fg)] bg-[var(--group-enfermaria-bg)] border-[var(--group-enfermaria-border)]",
    chartColor: "var(--group-enfermaria-chart)",
  },
  triagem: {
    label: "Triagem",
    network: "10.0.3.0/24",
    gateway: "gw-triagem",
    color:
      "text-[var(--group-triagem-fg)] bg-[var(--group-triagem-bg)] border-[var(--group-triagem-border)]",
    chartColor: "var(--group-triagem-chart)",
  },
}

/**
 * Resolve um rotulo amigavel para os identificadores dos grupos.
 */
export function groupLabel(group: string) {
  return GROUPS[group as GroupName]?.label ?? group
}
