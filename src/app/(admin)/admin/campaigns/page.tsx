// src/app/(admin)/admin/campaigns/page.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency, progressPercent, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminCampaignsPage() {
  const supabase = createServerSupabaseClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  const statusBadge: Record<string, string> = {
    draft: "bg-earth-100 text-earth-600",
    active: "bg-forest-100 text-forest-700",
    funded: "bg-earth-200 text-earth-700",
    completed: "bg-forest-200 text-forest-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-earth-900">Campaigns</h1>
          <p className="text-earth-500 text-sm mt-1">Manage all campaigns</p>
        </div>
        <Link href="/admin/campaigns/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-earth-100 bg-earth-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Campaign</th>
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Progress</th>
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Created</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-50">
            {campaigns?.map((campaign) => {
              const prog = progressPercent(campaign.raised_amount, campaign.target_amount);
              return (
                <tr key={campaign.id} className="hover:bg-earth-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-earth-800">{campaign.title}</p>
                    <p className="text-xs text-earth-400">{campaign.location}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 progress-bar">
                        <div className="progress-fill" style={{ width: `${prog}%` }} />
                      </div>
                      <span className="text-xs text-earth-500">
                        {formatCurrency(campaign.raised_amount)} / {formatCurrency(campaign.target_amount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge[campaign.status]}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-earth-400 text-xs">
                    {formatDate(campaign.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/campaigns/${campaign.id}/edit`} className="btn-ghost text-xs py-1 px-3">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!campaigns?.length && (
          <div className="py-16 text-center text-earth-400">
            <p>No campaigns yet.</p>
            <Link href="/admin/campaigns/new" className="btn-primary mt-4 inline-flex">Create your first campaign</Link>
          </div>
        )}
      </div>
    </div>
  );
}
