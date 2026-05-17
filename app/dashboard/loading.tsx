import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Section Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-emerald-100/50" />
          <Skeleton className="h-4 w-72 bg-emerald-50/50" />
        </div>
        <Skeleton className="h-10 w-32 bg-emerald-600/20" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border-none shadow-sm bg-white">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-gray-100" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2 bg-gray-100" />
                <Skeleton className="h-6 w-1/3 bg-gray-50" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-48 bg-gray-200" />
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 border-none shadow-sm bg-white flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4 bg-gray-100" />
                <Skeleton className="h-3 w-1/6 bg-gray-50" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-gray-100" />
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-gray-200" />
          <Card className="p-4 border-none shadow-sm bg-white space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded bg-gray-100" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-full bg-gray-100" />
                  <Skeleton className="h-2 w-2/3 bg-gray-50" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
