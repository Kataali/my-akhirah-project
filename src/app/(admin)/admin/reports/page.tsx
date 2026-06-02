// src/app/(admin)/admin/reports/page.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminReportsPage() {
  const supabase = createServerSupabaseClient();

  // Campaigns that are funded/completed but may need reports
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, location, status, updated_at")
    .in("status", ["funded", "completed"])
    .order("updated_at", { ascending: false });

  const { data: reports } = await supabase
    .from("impact_reports")
    .select("*, campaigns(title, location)")
    .order("created_at", { ascending: false });

  const reportedCampaignIds = new Set(reports?.map((r) => r.campaign_id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">Impact Reports</h1>
        <p className="text-earth-500 text-sm mt-1">Publish reports for funded and completed campaigns</p>
      </div>

      {/* Campaigns awaiting reports */}
      {campaigns?.filter((c) => !reportedCampaignIds.has(c.id)).length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-earth-700 mb-3 text-sm uppercase tracking-wide">Awaiting reports</h2>
          <div className="space-y-3">
            {campaigns
              ?.filter((c) => !reportedCampaignIds.has(c.id))
              .map((campaign) => (
                <div key={campaign.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-earth-800">{campaign.title}</p>
                    <p className="text-xs text-earth-400">{campaign.location} · {campaign.status}</p>
                  </div>
                  <Link
                    href={`/admin/reports/new?campaign_id=${campaign.id}`}
                    className="btn-primary flex items-center gap-1 text-sm py-1.5 px-3"
                  >
                    <Plus size={14} /> Write report
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Existing reports */}
      <div>
        <h2 className="font-semibold text-earth-700 mb-3 text-sm uppercase tracking-wide">Published reports</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-earth-100 bg-earth-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Report</th>
                <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Campaign</th>
                <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-50">
              {reports?.map((report) => {
                const campaign = report.campaigns as { title: string; location: string };
                return (
                  <tr key={report.id} className="hover:bg-earth-50/50">
                    <td className="px-5 py-4 font-medium text-earth-800">{report.title}</td>
                    <td className="px-5 py-4 text-earth-500">{campaign?.title}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        report.published ? "bg-forest-100 text-forest-700" : "bg-earth-100 text-earth-600"
                      }`}>
                        {report.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-earth-400 text-xs">{formatDate(report.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!reports?.length && (
            <div className="py-12 text-center text-earth-400 text-sm">No reports yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
