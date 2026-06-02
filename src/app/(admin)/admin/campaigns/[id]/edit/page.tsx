// src/app/(admin)/admin/campaigns/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import SubmitButton from "@/components/ui/SubmitButton";

async function updateCampaign(formData: FormData) {
  "use server";

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = slugify(title);

  // Parse items_needed JSON
  let items_needed = [];
  try {
    items_needed = JSON.parse(formData.get("items_needed") as string || "[]");
  } catch {
    items_needed = [];
  }

  const { error } = await admin.from("campaigns").update({
    title,
    slug,
    description: formData.get("description") as string,
    story: formData.get("story") as string,
    location: formData.get("location") as string,
    region: formData.get("region") as string,
    target_amount: parseFloat(formData.get("target_amount") as string),
    status: (formData.get("status") as "draft" | "active" | "funded" | "completed") ?? "draft",
    items_needed,
    beneficiaries_count: parseInt(formData.get("beneficiaries_count") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
  }).eq("id", id);

  if (error) throw new Error(error.message);

  redirect(`/admin/campaigns`);
}

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !campaign) {
    redirect("/admin/campaigns");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">Edit Campaign</h1>
        <p className="text-earth-500 text-sm mt-1">Update the details for {campaign.title}.</p>
      </div>

      <form action={updateCampaign} className="card p-7 space-y-5">
        <input type="hidden" name="id" value={campaign.id} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label">Campaign title *</label>
            <input name="title" required className="input" defaultValue={campaign.title} />
          </div>

          <div className="md:col-span-2">
            <label className="label">Short description *</label>
            <input name="description" required className="input" defaultValue={campaign.description} />
          </div>

          <div className="md:col-span-2">
            <label className="label">Full story *</label>
            <textarea name="story" required rows={6} className="input resize-none" defaultValue={campaign.story} />
          </div>

          <div>
            <label className="label">Location (village/town) *</label>
            <input name="location" required className="input" defaultValue={campaign.location} />
          </div>

          <div>
            <label className="label">Region *</label>
            <select name="region" className="input" defaultValue={campaign.region}>
              <option value="Northern Region">Northern Region</option>
              <option value="North East Region">North East Region</option>
              <option value="Savannah Region">Savannah Region</option>
              <option value="Upper East Region">Upper East Region</option>
              <option value="Upper West Region">Upper West Region</option>
            </select>
          </div>

          <div>
            <label className="label">Target amount (GHS) *</label>
            <input name="target_amount" type="number" min="100" step="0.01" required className="input" defaultValue={campaign.target_amount} />
          </div>

          <div>
            <label className="label">Estimated beneficiaries</label>
            <input name="beneficiaries_count" type="number" min="1" className="input" defaultValue={campaign.beneficiaries_count || ""} />
          </div>

          <div>
            <label className="label">End date</label>
            <input name="end_date" type="date" className="input" defaultValue={campaign.end_date || ""} />
          </div>

          <div>
            <label className="label">Status</label>
            <select name="status" className="input" defaultValue={campaign.status}>
              <option value="draft">Draft (not visible to public)</option>
              <option value="active">Active (live now)</option>
              <option value="funded">Funded (target reached)</option>
              <option value="completed">Completed (impact reported)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Items needed (JSON)</label>
            <textarea
              name="items_needed"
              rows={5}
              className="input resize-none font-mono text-xs"
              defaultValue={JSON.stringify(campaign.items_needed, null, 2)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/campaigns" className="btn-secondary">Cancel</Link>
          <SubmitButton>Save changes</SubmitButton>
        </div>
      </form>
    </div>
  );
}
