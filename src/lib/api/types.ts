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
