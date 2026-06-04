// src/lib/validations.ts
import * as z from "zod";

export const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Short description must be at least 20 characters").max(200),
  story: z.string().min(100, "Full story must be at least 100 characters"),
  location: z.string().min(2, "Location is required"),
  region: z.string().min(2, "Region is required"),
  target_amount: z.number().min(100, "Target amount must be at least 100 GHS"),
  currency: z.enum(["GHS", "USD"]),
  status: z.enum(["draft", "active", "funded", "completed"]),
  beneficiaries_count: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  items_needed: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    unit_cost_ghs: z.number()
  })).optional()
});

export type CampaignValues = z.infer<typeof campaignSchema>;

export const impactReportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  summary: z.string().min(50, "Summary must be at least 50 characters"),
  beneficiaries_reached: z.number().min(0),
  published: z.boolean().default(false),
  photos_urls: z.array(z.string()).optional(),
  items_delivered: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    unit_cost_ghs: z.number()
  })).optional()
});

export type ImpactReportValues = z.infer<typeof impactReportSchema>;
