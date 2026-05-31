"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function DashboardAutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }

    const id = window.setInterval(tick, intervalMs)

    return () => window.clearInterval(id)
  }, [intervalMs, router])

  return null
}
