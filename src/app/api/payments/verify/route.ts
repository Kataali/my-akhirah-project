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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/campaigns?payment=invalid`);
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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.redirect(`${appUrl}/dashboard?payment=failed`);
    }

    // Fetch existing contribution
    const { data: contribution } = await supabase
      .from("contributions")
      .select("*, campaigns(title, slug), profiles(full_name, email)")
      .eq("paystack_reference", reference)
      .single();

    if (!contribution) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.redirect(`${appUrl}/campaigns?payment=error`);
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/dashboard?payment=success&campaign=${contribution.campaigns.slug}`
    );
  } catch (err) {
    console.error("[payments/verify]", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/campaigns?payment=error`);
  }
}
