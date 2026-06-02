// src/app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { initializeTransaction, generateReference } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { campaign_id, campaign_slug, amount_ghs, message, anonymous } = body;

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

    const reference = generateReference(user.id);
    const callback_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?reference=${reference}`;

    // Create pending contribution record
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

    // Initialize Paystack transaction
    const transaction = await initializeTransaction({
      email: user.email!,
      amount_ghs,
      reference,
      campaign_id,
      campaign_title: campaign.title,
      callback_url,
    });

    return NextResponse.json(transaction);
  } catch (err) {
    console.error("[payments/initialize]", err);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
