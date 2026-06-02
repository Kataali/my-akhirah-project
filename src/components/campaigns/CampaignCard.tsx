// src/components/campaigns/CampaignCard.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Campaign } from "@/types/database";
import { formatCurrency, progressPercent, truncate } from "@/lib/utils";

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = progressPercent(campaign.raised_amount, campaign.target_amount);

  const statusColors: Record<Campaign["status"], string> = {
    draft: "bg-earth-100 text-earth-600",
    active: "bg-forest-100 text-forest-700",
    funded: "bg-earth-200 text-earth-700",
    completed: "bg-forest-200 text-forest-800",
  };

  return (
    <Link href={`/campaigns/${campaign.slug}`} className="card group flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover image */}
      <div className="relative h-48 bg-earth-100 overflow-hidden">
        {campaign.cover_image_url ? (
          <Image
            src={campaign.cover_image_url}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-earth-200 to-earth-300">
            <span className="font-display text-earth-500 text-4xl opacity-30">MAP</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[campaign.status]}`}>
          {campaign.status}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1 text-xs text-earth-400 mb-2">
          <MapPin size={12} />
          <span>{campaign.location}</span>
        </div>

        <h3 className="font-display text-lg font-bold text-earth-800 mb-2 group-hover:text-earth-600 transition-colors">
          {campaign.title}
        </h3>

        <p className="text-sm text-earth-500 leading-relaxed mb-4 flex-1">
          {truncate(campaign.description, 100)}
        </p>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-earth-500 mb-1.5">
            <span className="font-semibold text-earth-700">{formatCurrency(campaign.raised_amount)}</span>
            <span>{progress}% of {formatCurrency(campaign.target_amount)}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
