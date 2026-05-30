export function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatBytes(value: number | null | undefined) {
  if (!value) return "0 B"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${formatNumber(value / 1024, 1)} KB`
  return `${formatNumber(value / 1024 / 1024, 1)} MB`
}

export function formatBits(value: number | null | undefined) {
  if (!value) return "0 bps"
  if (value < 1000) return `${formatNumber(value, 0)} bps`
  if (value < 1000 * 1000) return `${formatNumber(value / 1000, 2)} Kbps`
  return `${formatNumber(value / 1000 / 1000, 2)} Mbps`
}

export function formatMs(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${formatNumber(value, 3)} ms`
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "-"
  return `${formatNumber(value, 2)}%`
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value))
}

export function formatReading(reading: Record<string, number | string>) {
  const entries = Object.entries(reading)
  if (!entries.length) return "-"

  return entries
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`)
    .join(" | ")
}
