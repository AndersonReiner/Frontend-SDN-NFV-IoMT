import {
  CardBlockSkeleton,
  DetailHeaderSkeleton,
  MetricCardsSkeleton,
} from "@/components/shared/page-skeletons"

export default function SensorDetailLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <DetailHeaderSkeleton />
      <MetricCardsSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <CardBlockSkeleton titleWidth="w-40" rows={4} />
        <CardBlockSkeleton titleWidth="w-40" rows={4} />
      </div>
      <CardBlockSkeleton titleWidth="w-52" rows={6} />
    </div>
  )
}
