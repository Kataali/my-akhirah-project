// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, progressPercent } from "@/lib/utils";
import { ArrowRight, TrendingUp, Heart } from "lucide-react";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { payment?: string; campaign?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: contributions } = await supabase
    .from("contributions")
    .select("*, campaigns(id, title, slug, cover_image_url, target_amount, raised_amount, status)")
    .eq("user_id", user.id)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  const totalContributed = contributions?.reduce((sum, c) => sum + c.amount, 0) ?? 0;
  const uniqueCampaigns = new Set(contributions?.map((c) => c.campaign_id)).size;

  const paymentStatus = searchParams.payment;

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-12">
      {/* Payment feedback banner */}
      {paymentStatus === "success" && (
        <div className="mb-6 rounded-xl bg-forest-50 border border-forest-200 p-4 text-forest-700 text-sm">
          🎉 <strong>JazakAllahu Khayran!</strong> Your contribution was received. You'll get an email receipt shortly.
        </div>
      )}
      {paymentStatus === "failed" && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          ⚠️ Your payment could not be completed. No money was deducted. Please try again.
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-1">Welcome back</p>
        <h1 className="section-heading">{profile?.full_name ?? profile?.email?.split("@")[0] ?? "Investor"}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: TrendingUp, label: "Total contributed", value: formatCurrency(totalContributed) },
          { icon: Heart, label: "Campaigns supported", value: String(uniqueCampaigns) },
          { icon: Heart, label: "Contributions made", value: String(contributions?.length ?? 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5">
            <Icon size={18} className="text-earth-300 mb-2" />
            <p className="font-display text-2xl font-bold text-earth-800">{value}</p>
            <p className="text-xs text-earth-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Contributions list */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-earth-800">Your Contributions</h2>
          <Link href="/campaigns" className="btn-ghost text-sm flex items-center gap-1 text-earth-500">
            Find new campaigns <ArrowRight size={14} />
          </Link>
        </div>

        {contributions && contributions.length > 0 ? (
          <div className="space-y-4">
            {contributions.map((c) => {
              const camp = c.campaigns as {
                title: string; slug: string; cover_image_url: string | null;
                target_amount: number; raised_amount: number; status: string;
              };
              const prog = progressPercent(camp.raised_amount, camp.target_amount);
              return (
                <div key={c.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <Link href={`/campaigns/${camp.slug}`} className="font-semibold text-earth-800 hover:text-earth-600 transition-colors">
                      {camp.title}
                    </Link>
                    <p className="text-xs text-earth-400 mt-1">{formatDate(c.created_at)}</p>
                    <div className="progress-bar mt-2 max-w-xs">
                      <div className="progress-fill" style={{ width: `${prog}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-earth-700">{formatCurrency(c.amount)}</p>
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                      camp.status === "completed" ? "bg-forest-100 text-forest-700" : "bg-earth-100 text-earth-600"
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-10 text-center text-earth-400">
            <p className="text-lg mb-3">No contributions yet</p>
            <Link href="/campaigns" className="btn-primary">Browse campaigns</Link>
          </div>
        )}
      </div>
    </div>
  );
}
