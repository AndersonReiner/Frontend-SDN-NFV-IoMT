import {
  CardBlockSkeleton,
  DataGridSkeleton,
  LogsSkeleton,
  MetricCardsSkeleton,
} from "@/components/shared/page-skeletons"

export default function GroupDetailLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <CardBlockSkeleton titleWidth="w-40" rows={3} />
      <MetricCardsSkeleton />
      <DataGridSkeleton titleWidth="w-40" columns={8} rows={5} />
      <div className="grid gap-4 xl:grid-cols-2">
        <CardBlockSkeleton titleWidth="w-40" rows={5} />
        <CardBlockSkeleton titleWidth="w-52" rows={6} />
      </div>
      <LogsSkeleton columns={1} />
    </div>
  )
}
