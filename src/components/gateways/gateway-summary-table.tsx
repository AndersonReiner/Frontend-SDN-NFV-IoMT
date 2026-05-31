import { groupLabel } from "@/config/groups"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GatewayStatus } from "@/lib/api/types"

/**
 * Resume o estado atual dos gateways VNF e das politicas detectadas em cada grupo.
 */
export function GatewaySummaryTable({ gateways }: { gateways: GatewayStatus[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gateways VNF</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Container</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP Forward</TableHead>
              <TableHead>Politicas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gateways.map((gateway) => (
              <TableRow key={gateway.container}>
                <TableCell className="font-medium">
                  {groupLabel(gateway.group)}
                </TableCell>
                <TableCell>{gateway.container}</TableCell>
                <TableCell>
                  <StatusBadge tone={gateway.running ? "success" : "danger"}>
                    {gateway.docker_status}
                  </StatusBadge>
                </TableCell>
                <TableCell>{gateway.ip_forward ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {gateway.policies.bandwidth_limit_active ? (
                      <Badge variant="outline">limitacao ativa</Badge>
                    ) : null}
                    {gateway.policies.network_emulation_active ? (
                      <Badge variant="outline">netem ativo</Badge>
                    ) : null}
                    {gateway.policies.triage_block_active ? (
                      <Badge variant="outline">triagem bloqueada</Badge>
                    ) : null}
                    {!gateway.policies.bandwidth_limit_active &&
                    !gateway.policies.network_emulation_active &&
                    !gateway.policies.triage_block_active ? (
                      <span className="text-muted-foreground">sem politica ativa</span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
