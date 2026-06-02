// src/app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import CampaignCard from "@/components/campaigns/CampaignCard";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  // Fetch 3 featured active campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch aggregate stats
  const { data: stats } = await supabase
    .from("contributions")
    .select("amount")
    .eq("status", "success");

  const totalRaised = stats?.reduce((sum, c) => sum + c.amount, 0) ?? 0;

  const { count: investorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "investor");

  const { count: campaignCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .in("status", ["funded", "completed"]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-earth-900 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url('/images/hero-pattern.svg')", backgroundSize: "60px" }} />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-block mb-4 rounded-full bg-earth-500/30 border border-earth-400/40 px-4 py-1 text-xs font-semibold text-earth-200 uppercase tracking-widest">
              Sadaqah Jariyah
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              Invest in the <span className="text-earth-400">Hereafter</span>.
              Change lives today.
            </h1>
            <p className="text-lg md:text-xl text-earth-200 leading-relaxed mb-8">
              My Akhirah Project channels your investments into delivering essential items — food, water, medicine, and shelter — to remote communities across Northern Ghana.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/campaigns" className="btn-primary bg-earth-500 hover:bg-earth-400 text-base px-7 py-3">
                View Campaigns <ArrowRight size={18} />
              </Link>
              <Link href="/about" className="btn-secondary border-earth-600 text-earth-100 bg-transparent hover:bg-earth-800 text-base px-7 py-3">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-earth-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Heart, label: "Raised", value: `GHS ${(totalRaised / 1000).toFixed(0)}k+` },
            { icon: Users, label: "Investors", value: `${investorCount ?? 0}+` },
            { icon: MapPin, label: "Campaigns completed", value: `${campaignCount ?? 0}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={20} className="text-earth-400 mb-1" />
              <p className="font-display text-3xl font-bold text-earth-800">{value}</p>
              <p className="text-sm text-earth-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Active Campaigns ── */}
      <section className="py-20 px-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-2">Active now</p>
              <h2 className="section-heading">Open Campaigns</h2>
            </div>
            <Link href="/campaigns" className="btn-ghost hidden md:flex items-center gap-1 text-earth-600">
              All campaigns <ArrowRight size={16} />
            </Link>
          </div>

          {campaigns && campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <p className="text-earth-500 text-center py-16">No active campaigns right now. Check back soon.</p>
          )}

          <div className="mt-8 flex justify-center md:hidden">
            <Link href="/campaigns" className="btn-secondary">View all campaigns</Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-earth-50 py-20 px-4 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-2">The process</p>
          <h2 className="section-heading mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Choose a campaign", body: "Browse active campaigns. Each one details the items needed, the community, and the funding goal." },
              { step: "02", title: "Make your contribution", body: "Invest any amount via card or mobile money (MTN MoMo, Vodafone Cash). You'll receive a receipt instantly." },
              { step: "03", title: "See your impact", body: "Once funded, our team delivers the items and publishes a full photo report. You'll be notified by email." },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-left">
                <span className="font-display text-4xl font-bold text-earth-200">{step}</span>
                <h3 className="font-display text-xl font-bold text-earth-800 mt-2 mb-3">{title}</h3>
                <p className="text-earth-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 md:px-8 bg-earth-700 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Every contribution counts
          </h2>
          <p className="text-earth-200 text-lg mb-8">
            Join hundreds of investors building their akhirah while transforming lives in Northern Ghana.
          </p>
          <Link href="/campaigns" className="btn-primary bg-earth-400 hover:bg-earth-300 text-earth-900 text-base px-8 py-3">
            Start investing today
          </Link>
        </div>
      </section>
    </>
  );
}
