export default function PublicLoading() {
  return (
    <div className="animate-pulse space-y-12 pb-20">
      {/* Hero Skeleton */}
      <div className="relative h-[450px] w-full bg-earth-100 rounded-2xl overflow-hidden" />

      <div className="container-custom grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="h-10 w-[80%] bg-earth-100 rounded-md" />
            <div className="flex gap-4">
              <div className="h-5 w-32 bg-earth-50 rounded-md" />
              <div className="h-5 w-32 bg-earth-50 rounded-md" />
            </div>
          </div>

          <div className="h-[2px] w-full bg-earth-50" />

          <div className="space-y-4">
            <div className="h-6 w-32 bg-earth-100 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-earth-50 rounded-md" />
              <div className="h-4 w-full bg-earth-50 rounded-md" />
              <div className="h-4 w-[90%] bg-earth-50 rounded-md" />
              <div className="h-4 w-[40%] bg-earth-50 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right Column - Donation Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 border-none shadow-xl space-y-6 sticky top-24">
            <div className="space-y-2">
              <div className="h-8 w-24 bg-earth-100 rounded-md" />
              <div className="h-2 w-full bg-earth-50 rounded-full" />
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-earth-50 rounded-md" />
                <div className="h-4 w-16 bg-earth-50 rounded-md" />
              </div>
            </div>
            <div className="h-12 w-full bg-earth-100 rounded-xl" />
            <div className="h-4 w-full bg-earth-50 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
