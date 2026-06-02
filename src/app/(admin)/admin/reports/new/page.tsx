// @ts-nocheck
// src/app/(admin)/admin/reports/new/page.tsx
import { redirect } from "next/navigation";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase/server";
import SubmitButton from "@/components/ui/SubmitButton";

async function createReport(formData: FormData) {
  "use server";

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  const campaign_id = formData.get("campaign_id") as string;

  // Parse photos_urls (comma-separated)
  const photosRaw = (formData.get("photos_urls") as string) ?? "";
  const photos_urls = photosRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  let items_delivered = [];
  try {
    items_delivered = JSON.parse(formData.get("items_delivered") as string || "[]");
  } catch {
    items_delivered = [];
  }

  const published = formData.get("published") === "true";

  const { error } = await admin.from("impact_reports").insert({
    campaign_id,
    title: formData.get("title") as string,
    summary: formData.get("summary") as string,
    photos_urls,
    items_delivered,
    beneficiaries_reached: parseInt(formData.get("beneficiaries_reached") as string) || 0,
    published,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);

  // Mark campaign as completed if publishing
  if (published) {
    await admin.from("campaigns").update({ status: "completed" }).eq("id", campaign_id);
  }

  redirect("/admin/reports");
}

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: { campaign_id?: string };
}) {
  const supabase = createServerSupabaseClient();

  // Load campaign info if pre-selected
  let campaign = null;
  if (searchParams.campaign_id) {
    const { data } = await supabase
      .from("campaigns")
      .select("id, title, items_needed")
      .eq("id", searchParams.campaign_id)
      .single();
    campaign = data;
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title")
    .in("status", ["funded", "completed"])
    .order("title");

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">New Impact Report</h1>
        <p className="text-earth-500 text-sm mt-1">Document the real-world impact of a completed campaign.</p>
      </div>

      <form action={createReport} className="card p-7 space-y-5">
        <div>
          <label className="label">Campaign *</label>
          <select name="campaign_id" required className="input" defaultValue={searchParams.campaign_id ?? ""}>
            <option value="" disabled>Select a campaign</option>
            {campaigns?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Report title *</label>
          <input name="title" required className="input" placeholder="e.g. Water filters delivered to Kpandai" />
        </div>

        <div>
          <label className="label">Summary *</label>
          <textarea name="summary" required rows={5} className="input resize-none"
            placeholder="Describe what was done, how the community responded, and what difference it made…" />
        </div>

        <div>
          <label className="label">Beneficiaries reached *</label>
          <input name="beneficiaries_reached" type="number" min="0" required className="input" placeholder="e.g. 134" />
        </div>

        <div>
          <label className="label">Photo URLs (one per line)</label>
          <textarea name="photos_urls" rows={4} className="input resize-none font-mono text-xs"
            placeholder={"https://supabase.co/storage/.../photo1.jpg\nhttps://supabase.co/storage/.../photo2.jpg"} />
          <p className="text-xs text-earth-400 mt-1">Upload photos to Supabase Storage first, then paste the public URLs here.</p>
        </div>

        <div>
          <label className="label">Items delivered (JSON)</label>
          <textarea name="items_delivered" rows={4} className="input resize-none font-mono text-xs"
            defaultValue={JSON.stringify(
              campaign?.items_needed ?? [{ name: "Example item", quantity: 50, unit: "units" }],
              null, 2
            )}
          />
        </div>

        <div>
          <label className="label">Publish immediately?</label>
          <select name="published" className="input">
            <option value="false">Save as draft</option>
            <option value="true">Publish now (notifies investors)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <a href="/admin/reports" className="btn-secondary">Cancel</a>
          <SubmitButton>Save report</SubmitButton>
        </div>
      </form>
    </div>
  );
}
