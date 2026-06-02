// src/app/(public)/campaigns/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency, progressPercent, formatDate } from "@/lib/utils";
import { MapPin, Users, Calendar, Package } from "lucide-react";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("campaigns").select("title, description").eq("slug", params.slug).single();
  if (!data) return { title: "Campaign not found" };
  return { title: data.title, description: data.description };
}

export default async function CampaignDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", params.slug)
    .in("status", ["active", "funded", "completed"])
    .single();

  if (!campaign) notFound();

  const progress = progressPercent(campaign.raised_amount, campaign.target_amount);

  // Fetch investor count for this campaign
  const { count: investorCount } = await supabase
    .from("contributions")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaign.id)
    .eq("status", "success");

  // Fetch impact report if completed
  const { data: report } = await supabase
    .from("impact_reports")
    .select("*")
    .eq("campaign_id", campaign.id)
    .eq("published", true)
    .single();

  const isOpen = campaign.status === "active";

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left: Main content ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover image */}
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-earth-100">
            {campaign.cover_image_url ? (
              <Image src={campaign.cover_image_url} alt={campaign.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-earth-300 to-earth-400 flex items-center justify-center">
                <span className="font-display text-white text-5xl opacity-30">MAP</span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div>
            <div className="flex flex-wrap gap-3 text-sm text-earth-500 mb-4">
              <span className="flex items-center gap-1"><MapPin size={14} />{campaign.location}, {campaign.region}</span>
              {campaign.beneficiaries_count && (
                <span className="flex items-center gap-1"><Users size={14} />{campaign.beneficiaries_count} beneficiaries</span>
              )}
              {campaign.end_date && (
                <span className="flex items-center gap-1"><Calendar size={14} />Closes {formatDate(campaign.end_date)}</span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-4">{campaign.title}</h1>
            <p className="text-earth-600 text-lg leading-relaxed">{campaign.description}</p>
          </div>

          {/* Story */}
          <div>
            <h2 className="font-display text-xl font-bold text-earth-800 mb-3">The Story</h2>
            <div className="prose prose-earth max-w-none text-earth-600 leading-relaxed whitespace-pre-line">
              {campaign.story}
            </div>
          </div>

          {/* Items needed */}
          {campaign.items_needed?.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-earth-800 mb-4 flex items-center gap-2">
                <Package size={18} className="text-earth-400" /> Items Needed
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-earth-100 text-left text-earth-500">
                      <th className="pb-2 font-semibold">Item</th>
                      <th className="pb-2 font-semibold text-right">Qty</th>
                      <th className="pb-2 font-semibold text-right">Unit cost</th>
                      <th className="pb-2 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.items_needed.map((item: { name: string; quantity: number; unit: string; unit_cost_ghs: number }, i: number) => (
                      <tr key={i} className="border-b border-earth-50">
                        <td className="py-2.5 text-earth-700">{item.name}</td>
                        <td className="py-2.5 text-right text-earth-500">{item.quantity} {item.unit}</td>
                        <td className="py-2.5 text-right text-earth-500">{formatCurrency(item.unit_cost_ghs)}</td>
                        <td className="py-2.5 text-right font-medium text-earth-700">{formatCurrency(item.unit_cost_ghs * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Impact report (if completed) */}
          {report && (
            <div className="card p-6 bg-forest-50 border-forest-200">
              <h2 className="font-display text-xl font-bold text-forest-800 mb-3">🎉 Impact Report</h2>
              <p className="text-forest-700 leading-relaxed">{report.summary}</p>
              {report.photos_urls?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {report.photos_urls.slice(0, 6).map((url: string, i: number) => (
                    <div key={i} className="relative h-32 rounded-lg overflow-hidden">
                      <Image src={url} alt={`Impact photo ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Investment card ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-earth-800 text-lg">{formatCurrency(campaign.raised_amount)}</span>
                <span className="text-earth-400">raised of {formatCurrency(campaign.target_amount)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-earth-400 mt-1.5">
                <span>{progress}% funded</span>
                <span>{investorCount ?? 0} investors</span>
              </div>
            </div>

            {isOpen ? (
              <Link href={`/invest/${campaign.slug}`} className="btn-primary w-full text-center text-base py-3">
                Invest in this campaign
              </Link>
            ) : (
              <div className="rounded-md bg-forest-50 border border-forest-200 p-4 text-center text-sm text-forest-700 font-medium">
                {campaign.status === "funded" ? "🎯 This campaign is fully funded!" : "✅ This campaign is completed."}
              </div>
            )}

            <p className="text-xs text-earth-400 text-center mt-3">
              Payments via card or Mobile Money (MTN, Vodafone)
            </p>

            <hr className="my-5 border-earth-100" />

            <div className="space-y-3 text-sm text-earth-600">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="capitalize font-medium text-earth-800">{campaign.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Location</span>
                <span className="font-medium text-earth-800">{campaign.region}</span>
              </div>
              {campaign.end_date && (
                <div className="flex justify-between">
                  <span>Closes</span>
                  <span className="font-medium text-earth-800">{formatDate(campaign.end_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
