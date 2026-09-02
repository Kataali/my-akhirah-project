"use client";
// src/app/(public)/invest/[slug]/page.tsx
// This is a Client Component because it initialises Paystack
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  target_amount: number;
  raised_amount: number;
  location: string;
};

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export default function InvestPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    async function load() {
      const [
        { data: camp },
        {
          data: { user: u },
        },
      ] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, slug, title, target_amount, raised_amount, location")
          .eq("slug", params.slug)
          .single(),
        supabase.auth.getUser(),
      ]);
      if (!camp) {
        router.push("/campaigns");
        return;
      }
      setCampaign(camp);
      if (u) setUser({ id: u.id, email: u.email! });
    }
    load();
  }, [params.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 5) return toast.error("Minimum contribution is GHS 5");

    // If user not authenticated, require guest email
    if (!user && !guestEmail)
      return toast.error("Please enter your email to continue as guest");

    setLoading(true);
    try {
      const payload: any = {
        campaign_id: campaign!.id,
        campaign_slug: campaign!.slug,
        amount_ghs: amt,
        message,
        anonymous,
      };

      if (!user) {
        // guest (visitor) flow: use provided guest inputs
        payload.guest_email = guestEmail;
        if (guestName) payload.guest_name = guestName;
      } else if (user && anonymous) {
        // logged-in user wants to donate anonymously — use guest flow but
        // reuse the logged-in user's email so we can still send a receipt.
        payload.guest_email = user.email;
        // do not attach user_id so the contribution remains anonymous/publicly guest
        if (guestName) payload.guest_name = guestName;
      }

      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to initialize payment");

      // Redirect to Paystack hosted payment page
      window.location.href = data.authorization_url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="flex flex-col items-center gap-4 text-earth-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="animate-pulse font-display text-lg tracking-wide">
            Loading Campaign...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href={`/campaigns/${campaign.slug}`}
        className="btn-ghost mb-6 -ml-2 text-earth-500"
      >
        <ArrowLeft size={16} /> Back to campaign
      </Link>

      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold text-earth-900 mb-1">
          Make a contribution
        </h1>
        <p className="text-earth-500 text-sm mb-6">
          {campaign.title} · {campaign.location}
        </p>

        {!user && (
          <div className="mb-6 rounded-lg bg-earth-50 border border-earth-200 p-4 text-sm text-earth-600">
            <div className="flex items-center gap-3">
              <Link
                href={`/auth/login?redirect=/invest/${campaign.slug}`}
                className="text-earth-700 font-semibold underline"
              >
                Sign in
              </Link>
              <span>to contribute and track your impact history.</span>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-earth-600">
                Or continue as guest — we'll email a receipt to you.
              </p>
              <div>
                <label className="label">Your name (optional)</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset amounts */}
          <div>
            <label className="label">Amount (GHS)</label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`rounded-md py-2 text-sm font-semibold border transition-colors ${
                    amount === String(preset)
                      ? "bg-earth-500 text-white border-earth-500"
                      : "border-earth-200 text-earth-600 hover:border-earth-400"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="5"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Or enter custom amount"
              className="input"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="label">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of encouragement…"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Anonymous */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded border-earth-300 text-earth-500 focus:ring-earth-300"
            />
            <span className="text-sm text-earth-600">
              Contribute anonymously
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !amount}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3 mt-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading
              ? "Redirecting to payment…"
              : `Contribute ${amount ? formatCurrency(parseFloat(amount)) : ""}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-earth-400">
            <Lock size={12} /> Secure payment via Paystack · Card or Mobile
            Money
          </p>
        </form>
      </div>
    </div>
  );
}
