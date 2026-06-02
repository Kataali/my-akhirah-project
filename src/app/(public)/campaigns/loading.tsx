export default function CampaignsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-12">
      {/* Header Skeleton */}
      <div className="mb-10 animate-pulse">
        <div className="h-4 w-32 bg-earth-200 rounded mb-4"></div>
        <div className="h-10 w-64 bg-earth-200 rounded mb-4"></div>
        <div className="h-16 w-full max-w-xl bg-earth-100 rounded"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-8 border-b border-earth-100 pb-4 animate-pulse">
        <div className="h-8 w-20 bg-earth-200 rounded-full"></div>
        <div className="h-8 w-20 bg-earth-200 rounded-full"></div>
        <div className="h-8 w-24 bg-earth-200 rounded-full"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col border border-earth-100 rounded-xl overflow-hidden bg-white">
            <div className="h-48 bg-earth-200 w-full"></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="h-6 w-3/4 bg-earth-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-earth-200 rounded mb-4"></div>
              <div className="mt-auto pt-4">
                <div className="h-2 w-full bg-earth-100 rounded-full overflow-hidden mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-4 w-1/3 bg-earth-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-earth-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
