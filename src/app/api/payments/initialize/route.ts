// src/app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction, generateReference } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    // allow guest donations when `guest_email` provided
    const { campaign_id, campaign_slug, amount_ghs, message, anonymous, guest_email, guest_name } = body;

    if (!user && !guest_email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // body parsed above

    if (!campaign_id || !amount_ghs || amount_ghs < 5) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify campaign is still active
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, title, status")
      .eq("id", campaign_id)
      .eq("status", "active")
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found or not active" }, { status: 404 });
    }

    const reference = generateReference(user ? user.id : "");
    const callback_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?reference=${reference}`;
    // Temporary debug log: record which callback URL is being sent to Paystack
    // This will appear in Render logs after we push/deploy.
    console.log("[payments/initialize] callback_url:", callback_url);

    // Create pending contribution record.
    // Prefer guest insertion when guest_email is provided so authenticated users
    // can opt into the guest/anonymous flow.
    if (guest_email) {
      const admin = createAdminClient();
      await admin.from("contributions").insert({
        guest_email: guest_email,
        campaign_id,
        amount: amount_ghs,
        currency: "GHS",
        paystack_reference: reference,
        status: "pending",
        message: message || null,
        anonymous: anonymous ?? false,
      });
    } else if (user) {
      await supabase.from("contributions").insert({
        user_id: user.id,
        campaign_id,
        amount: amount_ghs,
        currency: "GHS",
        paystack_reference: reference,
        status: "pending",
        message: message || null,
        anonymous: anonymous ?? false,
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize Paystack transaction
    const transaction = await initializeTransaction({
      email: user ? user.email! : guest_email,
      amount_ghs,
      reference,
      campaign_id,
      campaign_title: campaign.title,
      callback_url,
      metadata: { guest_name: guest_name ?? null },
    });

    // Debug: log Paystack transaction fields returned to the client
    console.log("[payments/initialize] paystack transaction authorization_url:", transaction.authorization_url);

    return NextResponse.json(transaction);
  } catch (err) {
    console.error("[payments/initialize]", err);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
