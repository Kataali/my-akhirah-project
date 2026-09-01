// src/app/(admin)/admin/campaigns/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { createAdminClient, createServerSupabaseClient, requireAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import CampaignEditForm from "@/components/admin/CampaignEditForm";

async function updateCampaign(formData: FormData) {
  "use server";

  const user = await requireAdmin();

  const admin = createAdminClient();

  const id = formData.get("id") as string;
  const requestedStatus = formData.get("status") as "draft" | "active" | "funded" | "completed";
  const title = formData.get("title") as string;
  const slug = slugify(title);

  const { data: existingCampaign, error: campaignError } = await admin
    .from("campaigns")
    .select("status")
    .eq("id", id)
    .single();

  if (campaignError || !existingCampaign) throw new Error("Campaign not found");

  const permittedStatuses = existingCampaign.status === "draft"
    ? ["draft", "active"]
    : [existingCampaign.status];

  if (!permittedStatuses.includes(requestedStatus)) {
    throw new Error("Campaign status can only move from draft to active. Funding and completion are system-managed.");
  }

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
    status: requestedStatus,
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

      <CampaignEditForm campaign={campaign} updateAction={updateCampaign} />
    </div>
  );
}
