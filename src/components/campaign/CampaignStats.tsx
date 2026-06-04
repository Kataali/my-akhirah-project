"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, progressPercent } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CampaignStatsProps {
  initialRaisedAmount: number;
  targetAmount: number;
  campaignId: string;
  campaignSlug: string;
  initialInvestorCount: number;
  status: string;
}

export default function CampaignStats({
  initialRaisedAmount,
  targetAmount,
  campaignId,
  campaignSlug,
  initialInvestorCount,
  status,
}: CampaignStatsProps) {
  const [raisedAmount, setRaisedAmount] = useState(initialRaisedAmount);
  const [investorCount, setInvestorCount] = useState(initialInvestorCount);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to changes in the campaigns table for this specific ID
    const channel = supabase
      .channel(`campaign-stats-${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "campaigns",
          filter: `id=eq.${campaignId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).raised_amount !== undefined) {
            setRaisedAmount((payload.new as any).raised_amount);
            setLastUpdate(Date.now());
          }
        }
      )
      .subscribe();

    // Also subscribe to new successful contributions to update investor count
    const contributionChannel = supabase
      .channel(`campaign-contributions-${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contributions",
          filter: `campaign_id=eq.${campaignId}`,
        },
        async (payload) => {
          if (payload.new && (payload.new as any).status === "success") {
            // Re-fetch exact count to be safe
            const { count } = await supabase
              .from("contributions")
              .select("*", { count: "exact", head: true })
              .eq("campaign_id", campaignId)
              .eq("status", "success");
            
            if (count !== null) setInvestorCount(count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(contributionChannel);
    };
  }, [campaignId, supabase]);

  const progress = progressPercent(raisedAmount, targetAmount);
  const isOpen = status === "active";

  return (
    <div className="card p-6 sticky top-24">
      <div className="mb-5">
        <div className="flex justify-between items-end text-sm mb-1.5">
          <div className="flex flex-col">
            <span className="text-earth-400 text-xs uppercase tracking-wider mb-0.5">Raised So Far</span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={raisedAmount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-earth-800 text-2xl"
              >
                {formatCurrency(raisedAmount)}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-earth-400 mb-1">of {formatCurrency(targetAmount)}</span>
        </div>
        
        <div className="progress-bar h-3">
          <motion.div 
            className="progress-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-earth-400 mt-2">
          <span className="font-medium text-earth-600">{progress}% funded</span>
          <span>{investorCount} investors</span>
        </div>
      </div>

      {isOpen ? (
        <Link 
          href={`/invest/${campaignSlug}`} 
          className="btn-primary w-full text-center text-lg py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Invest in this campaign
        </Link>
      ) : (
        <div className="rounded-xl bg-forest-50 border border-forest-100 p-5 text-center text-sm text-forest-700 font-semibold shadow-sm">
          {status === "funded" ? "🎯 This campaign is fully funded!" : "✅ This campaign is completed."}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-earth-400 uppercase tracking-widest">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-500"></span>
        </span>
        Live Updates Enabled
      </div>

      <hr className="my-6 border-earth-50" />

      <div className="space-y-4 text-sm text-earth-600 px-1">
        <div className="flex justify-between items-center">
          <span className="text-earth-400">Campaign Status</span>
          <span className="capitalize font-bold text-earth-700 px-2 py-0.5 bg-earth-50 rounded text-xs">{status}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-earth-400">Payment Methods</span>
          <div className="flex gap-1.5 opacity-60">
            <span title="Mobile Money" className="text-xs font-bold border border-earth-200 px-1 rounded">MoMo</span>
            <span title="Visa/Mastercard" className="text-xs font-bold border border-earth-200 px-1 rounded">Card</span>
          </div>
        </div>
      </div>
    </div>
  );
}
