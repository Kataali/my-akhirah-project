// @ts-nocheck
// src/app/(admin)/admin/campaigns/new/page.tsx
import { redirect } from "next/navigation";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import SubmitButton from "@/components/ui/SubmitButton";

async function createCampaign(formData: FormData) {
  "use server";

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  const title = formData.get("title") as string;
  const slug = slugify(title);

  // Parse items_needed JSON
  let items_needed = [];
  try {
    items_needed = JSON.parse(formData.get("items_needed") as string || "[]");
  } catch {
    items_needed = [];
  }

  const { data, error } = await admin.from("campaigns").insert({
    title,
    slug,
    description: formData.get("description") as string,
    story: formData.get("story") as string,
    location: formData.get("location") as string,
    region: formData.get("region") as string,
    target_amount: parseFloat(formData.get("target_amount") as string),
    currency: "GHS",
    status: (formData.get("status") as "draft" | "active") ?? "draft",
    items_needed,
    beneficiaries_count: parseInt(formData.get("beneficiaries_count") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    created_by: user.id,
  }).select("slug").single();

  if (error) throw new Error(error.message);

  redirect(`/admin/campaigns`);
}

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">New Campaign</h1>
        <p className="text-earth-500 text-sm mt-1">Fill in the details for the new campaign.</p>
      </div>

      <form action={createCampaign} className="card p-7 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label">Campaign title *</label>
            <input name="title" required className="input" placeholder="e.g. Water Filters for Tamale Community" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Short description *</label>
            <input name="description" required className="input" placeholder="One-line tagline shown on the campaign card" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Full story *</label>
            <textarea name="story" required rows={6} className="input resize-none" placeholder="Tell the story of this community and why this campaign matters…" />
          </div>

          <div>
            <label className="label">Location (village/town) *</label>
            <input name="location" required className="input" placeholder="e.g. Kpandai" />
          </div>

          <div>
            <label className="label">Region *</label>
            <select name="region" className="input">
              <option value="Northern Region">Northern Region</option>
              <option value="North East Region">North East Region</option>
              <option value="Savannah Region">Savannah Region</option>
              <option value="Upper East Region">Upper East Region</option>
              <option value="Upper West Region">Upper West Region</option>
            </select>
          </div>

          <div>
            <label className="label">Target amount (GHS) *</label>
            <input name="target_amount" type="number" min="100" step="0.01" required className="input" placeholder="5000" />
          </div>

          <div>
            <label className="label">Estimated beneficiaries</label>
            <input name="beneficiaries_count" type="number" min="1" className="input" placeholder="e.g. 120" />
          </div>

          <div>
            <label className="label">End date (optional)</label>
            <input name="end_date" type="date" className="input" />
          </div>

          <div>
            <label className="label">Status</label>
            <select name="status" className="input">
              <option value="draft">Draft (not visible to public)</option>
              <option value="active">Active (live now)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Items needed (JSON)</label>
            <textarea
              name="items_needed"
              rows={5}
              className="input resize-none font-mono text-xs"
              defaultValue={JSON.stringify([
                { name: "Water filter", quantity: 50, unit: "units", unit_cost_ghs: 80 },
                { name: "Rice (50kg bag)", quantity: 30, unit: "bags", unit_cost_ghs: 220 },
              ], null, 2)}
            />
            <p className="text-xs text-earth-400 mt-1">JSON array of {"{ name, quantity, unit, unit_cost_ghs }"}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <a href="/admin/campaigns" className="btn-secondary">Cancel</a>
          <SubmitButton>Create campaign</SubmitButton>
        </div>
      </form>
    </div>
  );
}
