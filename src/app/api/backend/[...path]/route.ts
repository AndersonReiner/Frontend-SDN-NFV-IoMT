import { NextRequest } from "next/server"

import { API_BASE_URL } from "@/lib/api/server"

/**
 * Contexto tipado do catch-all route handler usado pelo proxy interno.
 */
type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

/**
 * Encaminha requisicoes do frontend para o backend preservando metodo, query string e corpo.
 */
async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const target = new URL(`${API_BASE_URL}/${path.join("/")}`)
  target.search = request.nextUrl.search

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer()

  const response = await fetch(target, {
    method: request.method,
    body,
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
      "content-type": request.headers.get("content-type") ?? "application/json",
    },
    cache: "no-store",
  })

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  })
}

/**
 * Encaminha leituras GET para o backend.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context)
}

/**
 * Encaminha leituras HEAD para o backend.
 */
export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxy(request, context)
}

/**
 * Encaminha acoes POST para o backend.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context)
}
