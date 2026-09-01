// src/app/api/webhook/paystack/route.ts
// Handles Paystack server-to-server webhook events
// This runs independently of the user's browser session

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { markCampaignFundedIfEligible } from "@/lib/campaign-status";
import { sendDonationReceipt } from "@/lib/email";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const body = await req.text();

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  if (event.event === "charge.success") {
    const { reference } = event.data;

    // Idempotency: skip if already processed
    const { data: existing } = await supabase
      .from("contributions")
      .select("status, campaign_id")
      .eq("paystack_reference", reference)
      .single();

    if (existing?.status === "success") {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("contributions")
      .update({ status: "success", paystack_transaction_id: String(event.data.id) })
      .eq("paystack_reference", reference);

    // After marking contribution success, attempt to send a receipt email (idempotent).
    try {
      // Fetch contribution with related profile and campaign data for email
      const { data: contribution } = await supabase
        .from("contributions")
        .select("*, campaigns(title, slug), profiles(full_name, email)")
        .eq("paystack_reference", reference)
        .single();

      if (contribution?.profiles?.email) {
        await sendDonationReceipt({
          to: contribution.profiles.email,
          investor_name: contribution.profiles.full_name ?? "Friend",
          amount_ghs: contribution.amount,
          campaign_title: contribution.campaigns?.title ?? "",
          campaign_slug: contribution.campaigns?.slug ?? "",
          reference,
        });
      }
    } catch (err) {
      console.error("[webhook/paystack] sendDonationReceipt error:", err);
    }

    if (existing?.campaign_id) await markCampaignFundedIfEligible(existing.campaign_id);
  }

  return NextResponse.json({ received: true });
}
