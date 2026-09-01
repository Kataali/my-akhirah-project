import { createAdminClient } from "@/lib/supabase/server";

/** Move a live campaign to funded once confirmed contributions meet its target. */
export async function markCampaignFundedIfEligible(campaignId: string) {
  const supabase = createAdminClient();
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("status, raised_amount, target_amount")
    .eq("id", campaignId)
    .single();

  if (error || !campaign || campaign.status !== "active") return false;
  if (Number(campaign.raised_amount) < Number(campaign.target_amount)) return false;

  const { error: updateError } = await supabase
    .from("campaigns")
    .update({ status: "funded" })
    .eq("id", campaignId)
    .eq("status", "active");

  return !updateError;
}
