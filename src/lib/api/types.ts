export type GroupName = "uti" | "enfermaria" | "triagem"

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; message: string; detail?: unknown }

export type HealthResponse = {
  status: string
  docker: string
}

export type StatusResponse = {
  project: string
  total_containers: number
  running: number
  services: Record<string, string>
}

export type ContainerInfo = {
  name: string
  service: string
  status: string
  image: string
  id: string
}

export type CommandResult = {
  container: string
  command: string[]
  exit_code: number
  output: string
}

export type GatewayPolicyStatus = {
  bandwidth_limit_active: boolean
  triage_block_active: boolean
  network_emulation_active: boolean
}

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

export type GroupInfo = {
  group: GroupName
  gateway: string
  sensors: string[]
}

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

export type ReadingFieldStats = {
  samples: number
  min: number | null
  max: number | null
  avg: number | null
  last: number | string | null
}

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

export type SensorMetricsCollection = {
  source: string
  parsed_lines: number
  ignored_lines: number
  groups: Partial<Record<GroupName, Record<string, SensorMetrics>>>
}

export type TrafficMetrics = {
  source: string
  parsed_lines: number
  ignored_lines: number
  groups: Partial<Record<GroupName, GroupMetrics>>
}

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

export type TimeseriesMetricsResponse = {
  metrics: string[]
}

export type SeriesPoint = {
  t: string
  v: number | null
}

export type SensorSeries = {
  group: GroupName
  sensor: string
  points: SeriesPoint[]
}

export type TimeseriesSeries = {
  metric: string
  since: string | null
  until: string | null
  series: SensorSeries[]
}

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

export type PaginatedSnapshots = {
  total: number
  limit: number
  offset: number
  order: string
  items: SensorMetricsSnapshot[]
}

export type GroupRoutes = {
  group: GroupName
  gateway: CommandResult
  sensors: Record<string, CommandResult>
}

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

export type PolicyRouteKind = "tbf" | "netem" | null

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

export type PoliciesResponse = Record<string, PolicyEndpoint>

export type LogsResponse = {
  container?: string
  group?: GroupName
  source?: string
  logs: string | string[]
}

export type FastApiError = {
  detail?: string | { msg: string }[]
}

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

export type OpenApiSpec = {
  paths: Record<string, Record<string, OpenApiOperation>>
  components?: {
    schemas?: Record<string, Record<string, unknown>>
  }
}
