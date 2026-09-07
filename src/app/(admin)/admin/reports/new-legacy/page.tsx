// src/app/(admin)/admin/reports/new-legacy/page.tsx
// @ts-nocheck
import { redirect } from "next/navigation";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseDeliveredItems } from "@/lib/report-items";

async function createLegacyReport(formData: FormData) {
  "use server";

  const user = await requireAdmin();
  const admin = createAdminClient();

  const campaign_title = (formData.get("campaign_title") as string) || null;
  if (!campaign_title)
    throw new Error("Campaign title is required for legacy reports.");

  const photosRaw = (formData.get("photos_urls") as string) ?? "";
  const photos_urls = photosRaw
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const items_delivered = parseDeliveredItems(
    (formData.get("items_delivered") as string) || "",
  );

  const published = formData.get("published") === "true";
  const event_date = (formData.get("event_date") as string) || null;
  const campaign_location =
    (formData.get("campaign_location") as string) || null;

  const { error } = await admin.from("impact_reports").insert({
    campaign_id: null,
    campaign_title,
    campaign_location,
    event_date,
    title: formData.get("title") as string,
    summary: formData.get("summary") as string,
    photos_urls,
    items_delivered,
    beneficiaries_reached:
      parseInt(formData.get("beneficiaries_reached") as string) || 0,
    published,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);

  redirect("/admin/reports");
}

export default function NewLegacyReportPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">
          New Legacy Impact Report
        </h1>
        <p className="text-earth-500 text-sm mt-1">
          Create a report for a campaign that isn't in the site campaigns list.
        </p>
      </div>

      <form action={createLegacyReport} className="card p-7 space-y-5">
        <div>
          <label className="label">Campaign title *</label>
          <input
            name="campaign_title"
            required
            className="input"
            placeholder="e.g. Flood relief at Kpandai - June 2023"
          />
        </div>

        <div>
          <label className="label">Location *</label>
          <input
            name="campaign_location"
            required
            className="input"
            placeholder="e.g. Kpandai, Northern Region"
          />
        </div>

        <div>
          <label className="label">Report title *</label>
          <input
            name="title"
            required
            className="input"
            placeholder="e.g. Water filters delivered to Kpandai"
          />
        </div>

        <div>
          <label className="label">Event date *</label>
          <input
            name="event_date"
            type="date"
            required
            className="input"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
          <p className="text-xs text-earth-400 mt-1">
            Select the date the activity/donation occurred.
          </p>
        </div>

        <div>
          <label className="label">Summary *</label>
          <textarea
            name="summary"
            required
            rows={5}
            className="input resize-none"
            placeholder="Describe what was done, how the community responded, and what difference it made…"
          />
        </div>

        <div>
          <label className="label">Beneficiaries reached *</label>
          <input
            name="beneficiaries_reached"
            type="number"
            min="0"
            required
            className="input"
            placeholder="e.g. 134"
          />
        </div>

        <div>
          <label className="label">Photo URLs (one per line)</label>
          <textarea
            name="photos_urls"
            rows={4}
            className="input resize-none font-mono text-xs"
            placeholder={
              "https://.../photo1.jpg\nhttps://.../photo2.jpg, https://.../photo3.jpg"
            }
          />
          <p className="text-xs text-earth-400 mt-1">
            Upload photos to Supabase Storage first, then paste public URLs here
            — use newlines or commas to separate multiple URLs.
          </p>
        </div>

        <div>
          <label className="label">Items delivered</label>
          <textarea
            name="items_delivered"
            rows={4}
            className="input resize-none font-mono text-xs"
            defaultValue={JSON.stringify(
              [{ name: "Example item", quantity: 50, unit: "units" }],
              null,
              2,
            )}
          />
          <p className="text-xs text-earth-400 mt-1">
            Use a simple list like [sugar, rice], or detailed JSON with
            quantities.
          </p>
        </div>

        <div>
          <label className="label">Publish immediately?</label>
          <select name="published" className="input">
            <option value="false">Save as draft</option>
            <option value="true">Publish now (notifies investors)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <a href="/admin/reports" className="btn-secondary">
            Cancel
          </a>
          <SubmitButton>Save report</SubmitButton>
        </div>
      </form>
    </div>
  );
}
