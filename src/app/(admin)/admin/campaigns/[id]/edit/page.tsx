// src/app/(admin)/admin/campaigns/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { createAdminClient, createServerSupabaseClient, requireAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import CampaignEditForm from "@/components/admin/CampaignEditForm";
import { markCampaignFundedIfEligible } from "@/lib/campaign-status";

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

async function recordManualContribution(formData: FormData) {
  "use server";

  await requireAdmin();
  const admin = createAdminClient();

  const campaign_id = formData.get("campaign_id") as string;
  const amountRaw = formData.get("amount") as string;
  const amount = Number(amountRaw);
  const donor_name = ((formData.get("donor_name") as string) || "").trim();
  const donor_email = ((formData.get("donor_email") as string) || "").trim();
  const note = ((formData.get("note") as string) || "").trim();
  const anonymous = donor_name.length === 0;

  if (!campaign_id || !Number.isFinite(amount) || amount < 1) {
    redirect(`/admin/campaigns/${campaign_id}/edit?manual=invalid`);
  }

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, status")
    .eq("id", campaign_id)
    .single();

  if (!campaign || !["active", "funded", "completed"].includes(campaign.status)) {
    redirect(`/admin/campaigns/${campaign_id}/edit?manual=campaign_unavailable`);
  }

  const reference = `MANUAL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const donorLabel = donor_name || "In-person donor";
  const message = [
    `Manual in-person contribution from ${donorLabel}`,
    note ? `Note: ${note}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const { error } = await admin.from("contributions").insert({
    user_id: null,
    guest_email: donor_email || null,
    campaign_id,
    amount,
    currency: "GHS",
    paystack_reference: reference,
    paystack_transaction_id: null,
    status: "success",
    message,
    anonymous,
  });

  if (error) {
    redirect(`/admin/campaigns/${campaign_id}/edit?manual=error`);
  }

  await markCampaignFundedIfEligible(campaign_id);
  redirect(`/admin/campaigns/${campaign_id}/edit?manual=success`);
}

export default async function EditCampaignPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { manual?: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !campaign) {
    redirect("/admin/campaigns");
  }

  const manualStatus = searchParams.manual;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">Edit Campaign</h1>
        <p className="text-earth-500 text-sm mt-1">Update the details for {campaign.title}.</p>
      </div>

      {manualStatus === "success" && (
        <div className="mb-5 rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-700">
          Manual donation recorded successfully.
        </div>
      )}
      {manualStatus === "invalid" && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please enter a valid amount (minimum GHS 1).
        </div>
      )}
      {manualStatus === "campaign_unavailable" && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This campaign cannot accept manual donations in its current state.
        </div>
      )}
      {manualStatus === "error" && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Manual donation could not be saved. Please try again.
        </div>
      )}

      <CampaignEditForm campaign={campaign} updateAction={updateCampaign} />

      <div className="card p-7 space-y-5 mt-6">
        <div>
          <h2 className="font-display text-xl font-bold text-earth-900">Record In-Person Donation</h2>
          <p className="text-earth-500 text-sm mt-1">
            Use this when someone donates in person, cash, or outside Paystack.
          </p>
        </div>

        <form action={recordManualContribution} className="space-y-4">
          <input type="hidden" name="campaign_id" value={campaign.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (GHS) *</label>
              <input name="amount" type="number" min="1" step="0.01" required className="input" placeholder="e.g. 150" />
            </div>
            <div>
              <label className="label">Donor name</label>
              <input name="donor_name" className="input" placeholder="e.g. Abdul Rahman" />
            </div>
          </div>

          <div>
            <label className="label">Donor email (optional)</label>
            <input name="donor_email" type="email" className="input" placeholder="e.g. donor@example.com" />
          </div>

          <div>
            <label className="label">Internal note (optional)</label>
            <textarea name="note" rows={3} className="input resize-none" placeholder="Any receipt details, collector name, or context" />
          </div>

          <p className="text-xs text-earth-500">
            Leave donor name blank to keep this in-person contribution anonymous.
          </p>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Save Manual Donation</button>
          </div>
        </form>
      </div>
    </div>
  );
}
