// src/app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-earth-100 rounded-md mb-2" />
        <div className="h-4 w-64 bg-earth-50 rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 border-none shadow-sm space-y-3">
            <div className="h-5 w-5 bg-earth-100 rounded-full" />
            <div className="h-7 w-20 bg-earth-100 rounded-md" />
            <div className="h-3 w-16 bg-earth-50 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Large Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card h-[400px] border-none shadow-sm p-6">
            <div className="flex justify-between mb-8">
              <div className="h-6 w-32 bg-earth-100 rounded-md" />
              <div className="h-6 w-20 bg-earth-50 rounded-md" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 bg-earth-50 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-[60%] bg-earth-100 rounded-md" />
                    <div className="h-3 w-[40%] bg-earth-50 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidbar Cards */}
        <div className="space-y-6">
          <div className="card h-[250px] border-none shadow-sm p-6">
            <div className="h-5 w-32 bg-earth-100 rounded-md mb-6" />
            <div className="space-y-4">
              <div className="h-2 w-full bg-earth-50 rounded-full" />
              <div className="h-2 w-[80%] bg-earth-50 rounded-full" />
              <div className="h-2 w-[90%] bg-earth-50 rounded-full" />
            </div>
          </div>
          <div className="card h-[180px] border-none shadow-sm p-6">
            <div className="h-5 w-24 bg-earth-100 rounded-md mb-4" />
            <div className="h-10 w-full bg-earth-50 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
