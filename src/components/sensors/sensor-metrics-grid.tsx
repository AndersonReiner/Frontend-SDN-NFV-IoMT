"use client"

import Link from "next/link"
import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { GROUPS, groupLabel } from "@/config/groups"
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SensorMetrics } from "@/lib/api/types"
import {
  formatBits,
  formatDateTime,
  formatMs,
  formatNumber,
  formatPercent,
  formatReading,
} from "@/lib/format"

/**
 * Data grid com navegacao para o detalhe do sensor e metricas recentes consolidadas.
 */
export function SensorMetricsGrid({
  sensors,
  compact = false,
}: {
  sensors: SensorMetrics[]
  compact?: boolean
}) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: compact ? 5 : 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "last_seen", desc: true },
  ])

  const columns: ColumnDef<SensorMetrics>[] = [
    {
      accessorKey: "group",
      header: "Grupo",
      cell: ({ row }) => (
        <Badge className={GROUPS[row.original.group].color} variant="outline">
          {groupLabel(row.original.group)}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "sensor",
      header: "Sensor",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="h-auto p-0"
          nativeButton={false}
          render={
            <Link
              href={`/sensores/${row.original.group}/${row.original.sensor}`}
            />
          }
        >
          {row.original.sensor}
        </Button>
      ),
      size: 180,
      enableHiding: false,
    },
    {
      accessorKey: "last_reading",
      header: "Ultima leitura",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-xs">
          {formatReading(row.original.last_reading)}
        </span>
      ),
      size: 280,
    },
    {
      accessorKey: "messages",
      header: "Msgs",
      cell: ({ row }) => formatNumber(row.original.messages),
      size: 90,
      meta: {
        headerClassName: "text-right rtl:text-left",
        cellClassName: "text-right rtl:text-left",
      },
    },
    {
      accessorKey: "throughput_bps",
      header: "Vazao",
      cell: ({ row }) => formatBits(row.original.throughput_bps),
      size: 110,
    },
    {
      accessorKey: "avg_delay_ms",
      header: "Delay",
      cell: ({ row }) => formatMs(row.original.avg_delay_ms),
      size: 110,
    },
    {
      accessorKey: "jitter_ms",
      header: "Jitter",
      cell: ({ row }) => formatMs(row.original.jitter_ms),
      size: 110,
    },
    {
      accessorKey: "packet_loss_percent",
      header: "Perda",
      cell: ({ row }) => formatPercent(row.original.packet_loss_percent),
      size: 95,
    },
    {
      accessorKey: "last_seen",
      header: "Ultimo registro",
      cell: ({ row }) => formatDateTime(row.original.last_seen),
      size: 150,
    },
  ]

  const table = useReactTable({
    columns,
    data: sensors,
    pageCount: Math.ceil((sensors.length || 0) / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (!sensors.length) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Nenhuma metrica de sensor disponivel.
      </div>
    )
  }

  return (
    <DataGrid
      table={table}
      recordCount={sensors.length}
      tableLayout={{
        stripped: true,
        rowRounded: true,
      }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer border={false}>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <DataGridPagination sizes={compact ? [5, 10] : [10, 20, 50]} />
      </div>
    </DataGrid>
  )
}
