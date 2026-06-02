// src/app/(public)/impact/page.tsx
import Image from "next/image";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Impact",
  description: "See the real-world impact of contributions through My Akhirah Project.",
};

export default async function ImpactPage() {
  const supabase = createServerSupabaseClient();

  const { data: reports } = await supabase
    .from("impact_reports")
    .select("*, campaigns(title, location, slug)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-2">Real results</p>
        <h1 className="section-heading mb-4">Our Impact</h1>
        <p className="text-earth-500">
          Every completed campaign is followed by a full impact report — photos, items delivered, and the communities reached.
          This is your investment at work.
        </p>
      </div>

      {reports && reports.length > 0 ? (
        <div className="space-y-16">
          {reports.map((report) => {
            const campaign = report.campaigns as { title: string; location: string; slug: string };
            return (
              <div key={report.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Photos */}
                {report.photos_urls?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {report.photos_urls.slice(0, 4).map((url: string, i: number) => (
                      <div key={i} className={`relative rounded-xl overflow-hidden bg-earth-100 ${i === 0 ? "col-span-2 h-56" : "h-36"}`}>
                        <Image src={url} alt={`Impact photo ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-2">
                    {campaign.location}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-earth-900 mb-1">{report.title}</h2>
                  <p className="text-sm text-earth-400 mb-4">
                    {campaign.title} · {formatDate(report.created_at)}
                  </p>
                  <p className="text-earth-600 leading-relaxed mb-5">{report.summary}</p>

                  {/* Delivered items */}
                  {report.items_delivered?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-earth-500 uppercase tracking-wide mb-2">Items delivered</p>
                      <ul className="space-y-1">
                        {report.items_delivered.map((item: { name: string; quantity: number; unit: string }, i: number) => (
                          <li key={i} className="text-sm text-earth-600 flex gap-2">
                            <span className="text-earth-300">·</span>
                            {item.quantity} {item.unit} of {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-200 px-4 py-2 text-sm text-forest-700 font-medium">
                    <span>👥</span> {report.beneficiaries_reached} beneficiaries reached
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-earth-400">
          <p className="text-lg">Impact reports coming soon.</p>
          <p className="text-sm mt-2">As campaigns complete, we'll publish the full story here.</p>
        </div>
      )}
    </div>
  );
}
