// src/app/(public)/campaigns/page.tsx
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import CampaignCard from "@/components/campaigns/CampaignCard";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Browse active campaigns and invest in communities across Northern Ghana.",
};

type SearchParams = { status?: string };

export default async function CampaignsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabaseClient();
  const filter = searchParams.status ?? "active";

  let query = supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  } else {
    query = query.in("status", ["active", "funded", "completed"]);
  }

  const { data: campaigns } = await query;

  const FILTERS = [
    { value: "active", label: "Active" },
    { value: "funded", label: "Funded" },
    { value: "completed", label: "Completed" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-2">Make a difference</p>
        <h1 className="section-heading mb-3">Campaigns</h1>
        <p className="text-earth-500 max-w-xl">
          Each campaign represents a real community in Northern Ghana. Your investment directly purchases and delivers the items listed.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-8 border-b border-earth-100 pb-4">
        {FILTERS.map(({ value, label }) => (
          <a
            key={value}
            href={`/campaigns?status=${value}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === value
                ? "bg-earth-500 text-white"
                : "text-earth-500 hover:bg-earth-50"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Grid */}
      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-earth-400">
          <p className="text-lg">No campaigns found.</p>
          <p className="text-sm mt-2">Check back soon or try a different filter.</p>
        </div>
      )}
    </div>
  );
}
