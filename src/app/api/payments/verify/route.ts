// src/app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";
import { sendDonationReceipt } from "@/lib/email";
import { markCampaignFundedIfEligible } from "@/lib/campaign-status";
 
async function appendDebugLog(msg: string) {
  try {
    const fs = await import("fs");
    const path = "/tmp/paystack-verify.log";
    const line = `${new Date().toISOString()} ${msg}\n`;
    try {
      await fs.promises.appendFile(path, line, "utf8");
    } catch (e) {
      // ignore file write errors
    }
  } catch (e) {
    // fs not available (Edge runtime) — no-op
  }
}

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  // Debug: log incoming verify request URL and reference
  console.error("[payments/verify] incoming url:", req.url);
  console.error("[payments/verify] reference:", reference);
  await appendDebugLog(`[incoming] url=${req.url} reference=${reference}`);
  // Log host headers to see which host Paystack used when redirecting
  try {
    const host = req.headers.get('host');
    const xfh = req.headers.get('x-forwarded-host');
    const xff = req.headers.get('x-forwarded-for');
    console.error('[payments/verify] host header:', host);
    console.error('[payments/verify] x-forwarded-host:', xfh);
    console.error('[payments/verify] x-forwarded-for:', xff);
    await appendDebugLog(`[headers] host=${host} x-forwarded-host=${xfh} x-forwarded-for=${xff}`);
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

    // Send receipt email to profile email or guest email
    if (contribution.profiles?.email) {
      await sendDonationReceipt({
        to: contribution.profiles.email,
        investor_name: contribution.profiles.full_name ?? "Friend",
        amount_ghs: contribution.amount,
        campaign_title: contribution.campaigns.title,
        campaign_slug: contribution.campaigns.slug,
        reference,
      });
    } else if (contribution.guest_email) {
      await sendDonationReceipt({
        to: contribution.guest_email,
        investor_name: "Friend",
        amount_ghs: contribution.amount,
        campaign_title: contribution.campaigns.title,
        campaign_slug: contribution.campaigns.slug,
        reference,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    if (contribution.user_id) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?payment=success&campaign=${contribution.campaigns.slug}`
      );
    }

    return NextResponse.redirect(
      `${appUrl}/campaigns/${contribution.campaigns.slug}?payment=success`
    );
  } catch (err) {
    console.error("[payments/verify]", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/campaigns?payment=error`);
  }
}
