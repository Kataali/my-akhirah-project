// src/app/(admin)/admin/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Megaphone, Users, TrendingUp, FileText, ArrowRight } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = createServerSupabaseClient();

  const [
    { count: activeCampaigns },
    { count: totalInvestors },
    { data: contributions },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "investor"),
    supabase.from("contributions").select("amount").eq("status", "success"),
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "funded"),
  ]);

  const totalRaised = contributions?.reduce((sum, c) => sum + c.amount, 0) ?? 0;

  // Recent contributions
  const { data: recentContributions } = await supabase
    .from("contributions")
    .select("amount, created_at, anonymous, profiles(full_name, email), campaigns(title)")
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { icon: Megaphone, label: "Active campaigns", value: activeCampaigns ?? 0, href: "/admin/campaigns", color: "text-earth-500" },
    { icon: Users, label: "Total investors", value: totalInvestors ?? 0, href: "/admin/investors", color: "text-forest-600" },
    { icon: TrendingUp, label: "Total raised", value: formatCurrency(totalRaised), href: "#", color: "text-earth-600" },
    { icon: FileText, label: "Campaigns awaiting report", value: pendingReports ?? 0, href: "/admin/reports", color: "text-clay" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">Overview</h1>
        <p className="text-earth-500 text-sm mt-1">Welcome back. Here's a snapshot of My Akhirah Project.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, href, color }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <Icon size={20} className={`${color} mb-3`} />
            <p className="font-display text-2xl font-bold text-earth-900">{value}</p>
            <p className="text-xs text-earth-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent contributions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <h2 className="font-semibold text-earth-800">Recent Contributions</h2>
          <Link href="/admin/investors" className="text-xs text-earth-400 hover:text-earth-700 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-earth-50">
          {recentContributions?.map((c, i) => {
            const prof = c.profiles as { full_name?: string; email?: string } | null;
            const camp = c.campaigns as { title?: string } | null;
            return (
              <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="text-earth-700 font-medium">
                    {c.anonymous ? "Anonymous" : prof?.full_name ?? prof?.email ?? "Investor"}
                  </p>
                  <p className="text-xs text-earth-400">{camp?.title}</p>
                </div>
                <p className="font-semibold text-earth-700">{formatCurrency(c.amount)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
