// src/lib/paystack.ts
// Server-side Paystack utilities

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

type PaystackHeaders = {
  Authorization: string;
  "Content-Type": string;
};

function headers(): PaystackHeaders {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  };
}

// ─────────────────────────────────────────────
// Initialize a transaction (returns payment URL)
// ─────────────────────────────────────────────
export async function initializeTransaction(params: {
  email: string;
  amount_ghs: number; // in Ghana Cedis (we convert to pesewas)
  reference: string;
  campaign_id: string;
  campaign_title: string;
  callback_url: string;
}) {
  const amount_pesewas = Math.round(params.amount_ghs * 100);

  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: amount_pesewas,
      currency: "GHS",
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: {
        campaign_id: params.campaign_id,
        campaign_title: params.campaign_title,
        custom_fields: [
          {
            display_name: "Campaign",
            variable_name: "campaign_title",
            value: params.campaign_title,
          },
        ],
      },
      channels: ["card", "mobile_money", "bank"],
    }),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Paystack initialization failed");

  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

// ─────────────────────────────────────────────
// Verify a transaction after callback
// ─────────────────────────────────────────────
export async function verifyTransaction(reference: string) {
  const res = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: headers(),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Verification failed");

  return data.data as {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // in pesewas
    currency: string;
    paid_at: string;
    customer: { email: string; id: number };
    metadata: { campaign_id: string; campaign_title: string };
  };
}

// ─────────────────────────────────────────────
// Generate a unique reference
// ─────────────────────────────────────────────
export function generateReference(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MAP-${timestamp}-${random}`;
}

// ─────────────────────────────────────────────
// Verify Paystack webhook signature
// ─────────────────────────────────────────────
import crypto from "crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
