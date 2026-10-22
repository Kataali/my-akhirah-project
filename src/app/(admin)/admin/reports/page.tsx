// src/app/(admin)/admin/reports/page.tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminClient, createServerSupabaseClient, requireAdmin } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import type { ImpactReport } from "@/types/database";

type AdminReportRow = ImpactReport & {
  campaigns?: {
    title: string;
    location: string;
  } | null;
};

async function deleteImpactReport(formData: FormData) {
  "use server";

  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;

  const { data: report } = await admin
    .from("impact_reports")
    .select("id, campaign_id, published")
    .eq("id", id)
    .single();

  if (!report) throw new Error("Report not found.");
  if (report.published && report.campaign_id) {
    throw new Error(
      "Published campaign reports cannot be deleted. You can edit the report instead."
    );
  }

  const { error } = await admin.from("impact_reports").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/reports");
  revalidatePath("/impact");
}

export default async function AdminReportsPage() {
  const supabase = createServerSupabaseClient();

  // Campaigns that are funded/completed but may need reports
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, location, status, updated_at")
    .in("status", ["funded", "completed"])
    .order("updated_at", { ascending: false });

  const { data: rawReports } = await supabase
    .from("impact_reports")
    .select("*, campaigns(title, location)")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const reports: AdminReportRow[] = ((rawReports as AdminReportRow[] | null) ?? [])
    .slice()
    .sort((a: AdminReportRow, b: AdminReportRow) => {
      const dateA = new Date(a.event_date ?? a.created_at).getTime();
      const dateB = new Date(b.event_date ?? b.created_at).getTime();
      return dateB - dateA;
    });

  const reportedCampaignIds = new Set(reports?.map((r) => r.campaign_id));
  const awaitingCampaigns = (campaigns ?? []).filter((campaign) => !reportedCampaignIds.has(campaign.id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-earth-900">
            Impact Reports
          </h1>
          <p className="text-earth-500 text-sm mt-1">
            Publish reports for funded and completed campaigns
          </p>
        </div>

        <Link
          href="/admin/reports/new-legacy"
          className="btn-primary flex items-center gap-1 text-sm py-2 px-3.5"
        >
          <Plus size={14} /> Add legacy report
        </Link>
      </div>

      {/* Campaigns awaiting reports */}
      {awaitingCampaigns.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-earth-700 mb-3 text-sm uppercase tracking-wide">
            Awaiting reports
          </h2>
          <div className="space-y-3">
            {awaitingCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-earth-800">{campaign.title}</p>
                  <p className="text-xs text-earth-400">
                    {campaign.location} · {campaign.status}
                  </p>
                </div>
                <Link
                  href={`/admin/reports/new?campaign_id=${campaign.id}`}
                  className="btn-primary flex items-center justify-center gap-1 text-sm py-1.5 px-3 shrink-0 self-start sm:self-auto"
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
        <h2 className="font-semibold text-earth-700 mb-3 text-sm uppercase tracking-wide">
          Reports
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-sm">
              <thead>
                <tr className="border-b border-earth-100 bg-earth-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">
                    Report
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">
                    Campaign
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-earth-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-50">
                {reports?.map((report) => {
                  const campaign = report.campaigns as {
                    title: string;
                    location: string;
                  } | null;
                  const displayCampaignTitle =
                    campaign?.title ?? report.campaign_title ?? "";
                  const canDelete = !report.published || !report.campaign_id;
                  return (
                    <tr key={report.id} className="hover:bg-earth-50/50">
                      <td className="px-5 py-4 font-medium text-earth-800">
                        {report.title}
                      </td>
                      <td className="px-5 py-4 text-earth-500">
                        {displayCampaignTitle}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            report.published
                              ? "bg-forest-100 text-forest-700"
                              : "bg-earth-100 text-earth-600"
                          }`}
                        >
                          {report.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-earth-400 text-xs whitespace-nowrap">
                        {formatDate(report.event_date ?? report.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/reports/${report.id}/edit`}
                            className="text-earth-600 hover:text-earth-800 inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Pencil size={13} /> Edit
                          </Link>
                          {canDelete && (
                            <DeleteButton
                              id={report.id}
                              confirmMessage={`Delete report "${report.title}"?`}
                              deleteAction={deleteImpactReport}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!reports?.length && (
            <div className="py-12 text-center text-earth-400 text-sm">
              No reports yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
