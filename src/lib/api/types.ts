/**
 * Identificadores canonicos dos grupos hospitalares monitorados pela simulacao.
 */
export type GroupName = "uti" | "enfermaria" | "triagem"

/**
 * Resultado padronizado das chamadas ao backend.
 *
 * O frontend trabalha com esta uniao discriminada para evitar `throw`
 * durante a renderizacao das paginas e permitir fallbacks parciais.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; message: string; detail?: unknown }

/**
 * Resposta do endpoint de saude da API.
 */
export type HealthResponse = {
  status: string
  docker: string
}

/**
 * Resumo do projeto Docker Compose monitorado pelo backend.
 */
export type StatusResponse = {
  project: string
  total_containers: number
  running: number
  services: Record<string, string>
}

/**
 * Metadados de um container individual retornado pelo backend.
 */
export type ContainerInfo = {
  name: string
  service: string
  status: string
  image: string
  id: string
}

/**
 * Resultado textual de um comando executado no contexto de um gateway ou sensor.
 */
export type CommandResult = {
  container: string
  command: string[]
  exit_code: number
  output: string
}

/**
 * Sinais operacionais de politicas conhecidas pelo backend para um gateway.
 */
export type GatewayPolicyStatus = {
  bandwidth_limit_active: boolean
  triage_block_active: boolean
  network_emulation_active: boolean
}

/**
 * Estado operacional de um gateway VNF associado a um grupo hospitalar.
 */
export type GatewayStatus = {
  group: GroupName
  container: string
  docker_status: string
  running: boolean
  image: string | null
  id: string | null
  ip_forward: string | null
  interfaces: string | null
  tc_eth1: string | null
  policies: GatewayPolicyStatus
}

/**
 * Mapeamento estatico de um grupo, seu gateway e seus sensores.
 */
export type GroupInfo = {
  group: GroupName
  gateway: string
  sensors: string[]
}

/**
 * Metricas agregadas de trafego por grupo, derivadas do parser do backend.
 */
export type GroupMetrics = {
  group: GroupName
  messages: number
  bytes: number
  duration_seconds: number
  messages_per_second: number
  throughput_bps: number
  avg_delay_ms: number | null
  jitter_ms: number | null
  expected_messages: number
  missing_messages: number
  packet_loss_percent: number
}

/**
 * Estatisticas agregadas de um campo presente nas leituras de sensor.
 */
export type ReadingFieldStats = {
  samples: number
  min: number | null
  max: number | null
  avg: number | null
  last: number | string | null
}

/**
 * Consolidado operacional de um sensor clinico individual.
 */
export type SensorMetrics = {
  group: GroupName
  sensor: string
  origins: string[]
  messages: number
  bytes: number
  duration_seconds: number
  messages_per_second: number
  throughput_bps: number
  avg_payload_bytes: number
  avg_delay_ms: number | null
  min_delay_ms: number | null
  max_delay_ms: number | null
  jitter_ms: number | null
  expected_messages: number
  missing_messages: number
  packet_loss_percent: number
  first_seen: string | null
  last_seen: string | null
  last_sequence: number | null
  last_reading: Record<string, number | string>
  reading_stats: Record<string, ReadingFieldStats>
}

/**
 * Colecao de metricas por grupo e por sensor, conforme retornada pelo backend.
 */
export type SensorMetricsCollection = {
  source: string
  parsed_lines: number
  ignored_lines: number
  groups: Partial<Record<GroupName, Record<string, SensorMetrics>>>
}

/**
 * Colecao de metricas agregadas de trafego por grupo.
 */
export type TrafficMetrics = {
  source: string
  parsed_lines: number
  ignored_lines: number
  groups: Partial<Record<GroupName, GroupMetrics>>
}

/**
 * Metadados da base temporal persistida localmente pelo backend.
 */
export type TimeseriesStats = {
  db_path: string
  ingest_enabled: boolean
  ingest_interval_s: number
  ingest_tail: number
  total_rows: number
  first_capture: string | null
  last_capture: string | null
  distinct_groups: number
  distinct_sensors: number
}

/**
 * Lista de metricas historicas disponiveis no backend.
 */
export type TimeseriesMetricsResponse = {
  metrics: string[]
}

/**
 * Ponto individual de uma serie temporal.
 */
export type SeriesPoint = {
  t: string
  v: number | null
}

/**
 * Serie temporal de um sensor especifico dentro de um grupo.
 */
export type SensorSeries = {
  group: GroupName
  sensor: string
  points: SeriesPoint[]
}

/**
 * Resposta de uma consulta historica para uma metrica especifica.
 */
export type TimeseriesSeries = {
  metric: string
  since: string | null
  until: string | null
  series: SensorSeries[]
}

/**
 * Snapshot persistido da ultima coleta consolidada de um sensor.
 */
export type SensorMetricsSnapshot = {
  id: number
  captured_at: string
  tail: number
  grupo: GroupName
  sensor: string
  messages: number | null
  bytes: number | null
  duration_seconds: number | null
  messages_per_second: number | null
  throughput_bps: number | null
  avg_payload_bytes: number | null
  avg_delay_ms: number | null
  min_delay_ms: number | null
  max_delay_ms: number | null
  jitter_ms: number | null
  expected_messages: number | null
  missing_messages: number | null
  packet_loss_percent: number | null
  first_seen: string | null
  last_seen: string | null
  last_sequence: number | null
  origins: string[] | null
  last_reading: Record<string, number | string> | null
  reading_stats: Record<string, ReadingFieldStats> | null
}

/**
 * Envelope de paginacao para snapshots persistidos.
 */
export type PaginatedSnapshots = {
  total: number
  limit: number
  offset: number
  order: string
  items: SensorMetricsSnapshot[]
}

/**
 * Resultado de diagnostico de rotas para um grupo.
 */
export type GroupRoutes = {
  group: GroupName
  gateway: CommandResult
  sensors: Record<string, CommandResult>
}

/**
 * Endpoint de politica fixo anunciado pelo backend.
 */
export type PolicyEndpoint = {
  key: string
  method: string
  path: string
  group: GroupName | null
  action: string
  description: string
  request_body_required: boolean
  request_body_schema: Record<string, unknown> | null
  request_example: Record<string, unknown> | null
  response_model: string
  status_endpoint: string
}

/**
 * Tipos de corpo de requisicao suportados para politicas dinamicas.
 */
export type PolicyRouteKind = "tbf" | "netem" | null

/**
 * Estrutura intermediaria usada pelo frontend para compor uma rota dinamica de politica.
 */
export type PolicyRouteDraft = {
  group: GroupName
  action: "limit" | "limit_clear" | "netem" | "netem_clear"
  title: string
  description: string
  path: string
  body_kind: PolicyRouteKind
  body_defaults: Record<string, string | number> | null
  status_endpoint: string
}

/**
 * Rota de politica pronta para execucao pela interface.
 */
export type PolicyRoute = {
  key: string
  group: GroupName
  action: "limit" | "limit_clear" | "netem" | "netem_clear"
  title: string
  description: string
  method: string
  path: string
  request_body_required: boolean
  body_kind: PolicyRouteKind
  body_defaults: Record<string, string | number> | null
  status_endpoint: string
}

/**
 * Familia de politicas complementares para um grupo: aplicar e limpar.
 */
export type PolicyFamily = {
  group: GroupName
  title: string
  description: string
  current_policy_state: {
    bandwidth_limit_active: boolean
    triage_block_active: boolean
    network_emulation_active: boolean
  }
  apply: PolicyRoute
  clear: PolicyRoute
}

/**
 * Indice de politicas fixas expostas pelo backend.
 */
export type PoliciesResponse = Record<string, PolicyEndpoint>

/**
 * Resposta de endpoints de log textual.
 */
export type LogsResponse = {
  container?: string
  group?: GroupName
  source?: string
  logs: string | string[]
}

/**
 * Formato simplificado de erro emitido pela FastAPI.
 */
export type FastApiError = {
  detail?: string | { msg: string }[]
}

/**
 * Fragmento do OpenAPI suficiente para descobrir operacoes de politica.
 */
export type OpenApiOperation = {
  summary?: string
  description?: string
  requestBody?: {
    required?: boolean
    content?: {
      "application/json"?: {
        schema?: Record<string, unknown>
      }
    }
  }
  responses?: Record<string, unknown>
}

/**
 * Recorte minimo da especificacao OpenAPI consumido pela tela de politicas.
 */
export type OpenApiSpec = {
  paths: Record<string, Record<string, OpenApiOperation>>
  components?: {
    schemas?: Record<string, Record<string, unknown>>
  }
}
