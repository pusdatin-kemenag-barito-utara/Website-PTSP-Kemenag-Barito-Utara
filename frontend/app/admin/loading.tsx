import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64 bg-emerald-100/50" />
        <Skeleton className="h-5 w-96 bg-emerald-50/50" />
      </div>

      {/* Stats/Filter Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 bg-gray-100" />
        <Skeleton className="h-12 w-32 bg-gray-100" />
      </div>

      {/* Table Skeleton */}
      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="border-b p-4 flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 flex-1 bg-gray-50" />
          ))}
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-12 w-12 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 bg-gray-100" />
                <Skeleton className="h-3 w-1/4 bg-gray-50" />
              </div>
              <Skeleton className="h-8 w-24 bg-gray-100" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
