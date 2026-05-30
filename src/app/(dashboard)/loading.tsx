import {
  CardBlockSkeleton,
  DashboardLoadingSkeleton,
  DataGridSkeleton,
  DetailHeaderSkeleton,
  LogsSkeleton,
  MetricCardsSkeleton,
} from "@/components/shared/page-skeletons"

export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <DetailHeaderSkeleton />
      <MetricCardsSkeleton />
      <DashboardLoadingSkeleton />
      <div className="grid gap-4 xl:grid-cols-2">
        <CardBlockSkeleton titleWidth="w-44" rows={6} />
        <DataGridSkeleton titleWidth="w-36" columns={6} rows={5} />
      </div>
      <LogsSkeleton columns={1} />
    </div>
  )
}
