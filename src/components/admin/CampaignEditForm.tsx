"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignSchema, type CampaignValues } from "@/lib/validations";
import SubmitButton from "@/components/ui/SubmitButton";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campaign } from "@/types/database";

interface CampaignEditFormProps {
  campaign: Campaign;
  updateAction: (formData: FormData) => Promise<void>;
}

export default function CampaignEditForm({ campaign, updateAction }: CampaignEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const availableStatuses = campaign.status === "draft" ? ["draft", "active"] : [campaign.status];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: campaign.title,
      description: campaign.description,
      story: campaign.story,
      location: campaign.location,
      region: campaign.region,
      target_amount: campaign.target_amount,
      status: campaign.status,
      beneficiaries_count: campaign.beneficiaries_count,
      end_date: campaign.end_date,
      currency: campaign.currency,
      items_needed: campaign.items_needed as any[],
    },
  });

  const onSubmit = async (data: CampaignValues) => {
    try {
      setError(null);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "items_needed") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append("id", campaign.id);
      
      await updateAction(formData);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-7 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="label">Campaign title *</label>
          <input 
            {...register("title")} 
            className={`input ${errors.title ? "border-red-500" : ""}`} 
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="label">Short description *</label>
          <input 
            {...register("description")} 
            className={`input ${errors.description ? "border-red-500" : ""}`} 
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="label">Full story *</label>
          <textarea 
            {...register("story")} 
            rows={6} 
            className={`input resize-none ${errors.story ? "border-red-500" : ""}`} 
          />
          {errors.story && <p className="text-red-500 text-xs mt-1">{errors.story.message}</p>}
        </div>

        <div>
          <label className="label">Location (village/town) *</label>
          <input 
            {...register("location")} 
            className={`input ${errors.location ? "border-red-500" : ""}`} 
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="label">Region *</label>
          <select 
            {...register("region")} 
            className="input"
          >
            <option value="Northern Region">Northern Region</option>
            <option value="North East Region">North East Region</option>
            <option value="Savannah Region">Savannah Region</option>
            <option value="Upper East Region">Upper East Region</option>
            <option value="Upper West Region">Upper West Region</option>
          </select>
        </div>

        <div>
          <label className="label">Target amount (GHS) *</label>
          <input 
            {...register("target_amount", { valueAsNumber: true })} 
            type="number" 
            className={`input ${errors.target_amount ? "border-red-500" : ""}`} 
          />
          {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount.message}</p>}
        </div>

        <div>
          <label className="label">Estimated beneficiaries</label>
          <input 
            {...register("beneficiaries_count", { valueAsNumber: true })} 
            type="number" 
            className="input" 
          />
        </div>

        <div>
          <label className="label">End date</label>
          <input 
            {...register("end_date")} 
            type="date" 
            className="input" 
          />
        </div>

        <div>
          <label className="label">Status</label>
          <select 
            {...register("status")} 
            className="input"
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "draft" && "Draft (not visible to public)"}
                {status === "active" && "Active (live now)"}
                {status === "funded" && "Funded (target reached)"}
                {status === "completed" && "Completed (impact reported)"}
              </option>
            ))}
          </select>
          {campaign.status !== "draft" && (
            <p className="text-xs text-earth-400 mt-1">
              This status is managed automatically by confirmed payments and published impact reports.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="label">Items needed (JSON)</label>
          <textarea
            {...register("items_needed", {
              setValueAs: (v) => {
                try { return typeof v === 'string' ? JSON.parse(v) : v; }
                catch { return v; }
              }
            })}
            rows={5}
            className="input resize-none font-mono text-xs"
            placeholder='[{"name": "Water Tank", "quantity": 1, "unit": "pc", "unit_cost_ghs": 1500}]'
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/campaigns" className="btn-secondary">Cancel</Link>
        <SubmitButton isLoading={isSubmitting}>Save changes</SubmitButton>
      </div>
    </form>
  );
}
