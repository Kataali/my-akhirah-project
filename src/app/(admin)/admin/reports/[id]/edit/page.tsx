import { redirect } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import { createAdminClient, createServerSupabaseClient, requireAdmin } from "@/lib/supabase/server";
import { parseDeliveredItems } from "@/lib/report-items";

async function updateReport(formData: FormData) {
  "use server";

  await requireAdmin();
  const admin = createAdminClient();
  const reportId = formData.get("id") as string;
  const requestedPublished = formData.get("published") === "true";

  const { data: existing, error: reportError } = await admin
    .from("impact_reports")
    .select("campaign_id, published")
    .eq("id", reportId)
    .single();

  if (reportError || !existing) throw new Error("Report not found");
  if (existing.published && !requestedPublished) {
    throw new Error("Published reports cannot be reverted to draft.");
  }

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("status")
    .eq("id", existing.campaign_id)
    .single();

  if (campaignError || !campaign || !["funded", "completed"].includes(campaign.status)) {
    throw new Error("Impact reports can only be published for funded campaigns.");
  }

  const photosUrls = ((formData.get("photos_urls") as string) ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  const itemsDelivered = parseDeliveredItems((formData.get("items_delivered") as string) || "");

  const { error } = await admin
    .from("impact_reports")
    .update({
      title: formData.get("title") as string,
      summary: formData.get("summary") as string,
      photos_urls: photosUrls,
      items_delivered: itemsDelivered,
      beneficiaries_reached: parseInt(formData.get("beneficiaries_reached") as string, 10) || 0,
      published: requestedPublished,
    })
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  if (requestedPublished) {
    await admin
      .from("campaigns")
      .update({ status: "completed" })
      .eq("id", existing.campaign_id)
      .eq("status", "funded");
  }

  redirect("/admin/reports");
}

export default async function EditReportPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: report, error } = await supabase
    .from("impact_reports")
    .select("*, campaigns(title)")
    .eq("id", params.id)
    .single();

  if (error || !report) redirect("/admin/reports");

  const campaign = report.campaigns as { title: string } | null;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">Edit Impact Report</h1>
        <p className="text-earth-500 text-sm mt-1">{campaign?.title ?? "Campaign report"}</p>
      </div>

      <form action={updateReport} className="card p-7 space-y-5">
        <input type="hidden" name="id" value={report.id} />
        <div>
          <label className="label">Report title *</label>
          <input name="title" required defaultValue={report.title} className="input" />
        </div>
        <div>
          <label className="label">Summary *</label>
          <textarea name="summary" required rows={5} defaultValue={report.summary} className="input resize-none" />
        </div>
        <div>
          <label className="label">Beneficiaries reached *</label>
          <input name="beneficiaries_reached" type="number" min="0" required defaultValue={report.beneficiaries_reached} className="input" />
        </div>
        <div>
          <label className="label">Photo URLs (one per line)</label>
          <textarea name="photos_urls" rows={4} defaultValue={report.photos_urls.join("\n")} className="input resize-none font-mono text-xs" />
        </div>
        <div>
          <label className="label">Items delivered</label>
          <textarea name="items_delivered" rows={4} defaultValue={JSON.stringify(report.items_delivered, null, 2)} className="input resize-none font-mono text-xs" />
          <p className="text-xs text-earth-400 mt-1">Use a simple list like [sugar, rice], or detailed JSON with quantities.</p>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="published" className="input" defaultValue={String(report.published)}>
            {!report.published && <option value="false">Draft</option>}
            <option value="true">Published</option>
          </select>
          {report.published ? (
            <p className="text-xs text-earth-400 mt-1">Published reports remain published.</p>
          ) : (
            <p className="text-xs text-earth-400 mt-1">Publishing this report will mark its campaign as completed.</p>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <a href="/admin/reports" className="btn-secondary">Cancel</a>
          <SubmitButton loadingText="Saving report...">Save report</SubmitButton>
        </div>
      </form>
    </div>
  );
}
