// src/app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";
import { sendDonationReceipt } from "@/lib/email";
import { markCampaignFundedIfEligible } from "@/lib/campaign-status";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  // Debug: log incoming verify request URL and reference
  console.log("[payments/verify] incoming url:", req.url);
  console.log("[payments/verify] reference:", reference);
  // Log host headers to see which host Paystack used when redirecting
  try {
    console.log('[payments/verify] host header:', req.headers.get('host'));
    console.log('[payments/verify] x-forwarded-host:', req.headers.get('x-forwarded-host'));
    console.log('[payments/verify] x-forwarded-for:', req.headers.get('x-forwarded-for'));
  } catch (err) {
    console.error('[payments/verify] error reading headers', err);
  }
  if (!reference) {
    return NextResponse.redirect(new URL("/campaigns?payment=invalid", req.url));
  }

  try {
    const supabase = createAdminClient();

    // Verify with Paystack
    const tx = await verifyTransaction(reference);

    if (tx.status !== "success") {
      await supabase
        .from("contributions")
        .update({ status: "failed" })
        .eq("paystack_reference", reference);
      return NextResponse.redirect(new URL("/dashboard?payment=failed", req.url));
    }

    // Fetch existing contribution
    const { data: contribution } = await supabase
      .from("contributions")
      .select("*, campaigns(title, slug), profiles(full_name, email)")
      .eq("paystack_reference", reference)
      .single();

    if (!contribution) {
      return NextResponse.redirect(new URL("/campaigns?payment=error", req.url));
    }

    // Mark as successful (trigger auto-updates raised_amount via DB trigger)
    await supabase
      .from("contributions")
      .update({
        status: "success",
        paystack_transaction_id: String(tx.id),
      })
      .eq("paystack_reference", reference);

    // Fallback for delayed or missed payment webhooks.
    await markCampaignFundedIfEligible(contribution.campaign_id);

    // Send receipt email
    if (contribution.profiles?.email) {
      await sendDonationReceipt({
        to: contribution.profiles.email,
        investor_name: contribution.profiles.full_name ?? "Friend",
        amount_ghs: contribution.amount,
        campaign_title: contribution.campaigns.title,
        campaign_slug: contribution.campaigns.slug,
        reference,
      });
    }

    return NextResponse.redirect(
      new URL(`/dashboard?payment=success&campaign=${contribution.campaigns.slug}`, req.url)
    );
  } catch (err) {
    console.error("[payments/verify]", err);
    return NextResponse.redirect(new URL("/campaigns?payment=error", req.url));
  }
}
