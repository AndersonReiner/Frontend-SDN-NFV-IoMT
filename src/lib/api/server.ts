import "server-only"

import type { ApiResult, FastApiError } from "@/lib/api/types"

export const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000"

function parseErrorMessage(status: number, body: unknown) {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as FastApiError).detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ")
  }

  return `Backend respondeu com HTTP ${status}`
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    })

    const text = await response.text()
    const body = text ? JSON.parse(text) : null

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: parseErrorMessage(response.status, body),
        detail: body,
      }
    }

    return { ok: true, data: body as T }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Nao foi possivel conectar ao backend",
    }
  }
}

export function dataOr<T>(result: ApiResult<T>, fallback: T): T {
  return result.ok ? result.data : fallback
}
