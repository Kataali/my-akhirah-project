// src/app/(admin)/loading.tsx
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center text-earth-400">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-earth-600" />
        <p className="text-sm font-medium animate-pulse">Loading workspace...</p>
      </div>
    </div>
  );
}
