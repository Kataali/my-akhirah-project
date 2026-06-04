"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignSchema, type CampaignValues } from "@/lib/validations";
import SubmitButton from "@/components/ui/SubmitButton";
import Link from "next/link";
import { useState } from "react";

interface CampaignNewFormProps {
  createAction: (formData: FormData) => Promise<void>;
}

export default function CampaignNewForm({ createAction }: CampaignNewFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      story: "",
      location: "",
      region: "Northern Region",
      target_amount: 1000,
      status: "draft",
      currency: "GHS",
      items_needed: [
        { name: "Water filter", quantity: 50, unit: "units", unit_cost_ghs: 80 },
        { name: "Rice (50kg bag)", quantity: 30, unit: "bags", unit_cost_ghs: 220 },
      ],
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
      
      await createAction(formData);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating.");
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
            placeholder="e.g. Water Filters for Tamale Community"
            className={`input ${errors.title ? "border-red-500" : ""}`} 
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="label">Short description *</label>
          <input 
            {...register("description")} 
            placeholder="One-line tagline shown on the campaign card"
            className={`input ${errors.description ? "border-red-500" : ""}`} 
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="label">Full story *</label>
          <textarea 
            {...register("story")} 
            rows={6} 
            placeholder="Tell the story of this community and why this campaign matters…"
            className={`input resize-none ${errors.story ? "border-red-500" : ""}`} 
          />
          {errors.story && <p className="text-red-500 text-xs mt-1">{errors.story.message}</p>}
        </div>

        <div>
          <label className="label">Location (village/town) *</label>
          <input 
            {...register("location")} 
            placeholder="e.g. Kpandai"
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
            placeholder="5000"
            className={`input ${errors.target_amount ? "border-red-500" : ""}`} 
          />
          {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount.message}</p>}
        </div>

        <div>
          <label className="label">Estimated beneficiaries</label>
          <input 
            {...register("beneficiaries_count", { valueAsNumber: true })} 
            type="number" 
            placeholder="e.g. 120"
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
            <option value="draft">Draft (not visible to public)</option>
            <option value="active">Active (live now)</option>
          </select>
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
            placeholder='[{"name": "Water filter", "quantity": 50, "unit": "units", "unit_cost_ghs": 80}]'
          />
          <p className="text-xs text-earth-400 mt-1">JSON array of {"{ name, quantity, unit, unit_cost_ghs }"}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/campaigns" className="btn-secondary">Cancel</Link>
        <SubmitButton isLoading={isSubmitting}>Create campaign</SubmitButton>
      </div>
    </form>
  );
}
