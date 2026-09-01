import { redirect } from "next/navigation";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import CampaignNewForm from "@/components/admin/CampaignNewForm";

async function createCampaign(formData: FormData) {
  "use server";

  const user = await requireAdmin();

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

      <CampaignNewForm createAction={createCampaign} />
    </div>
  );
}
