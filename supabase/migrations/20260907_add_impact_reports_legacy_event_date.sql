-- Migration: add legacy campaign support and event_date to impact_reports
-- Generated: 2026-09-07

BEGIN;

-- allow reports without a campaign reference
ALTER TABLE public.impact_reports
  ALTER COLUMN campaign_id DROP NOT NULL;

-- add freeform campaign title
ALTER TABLE public.impact_reports
  ADD COLUMN IF NOT EXISTS campaign_title text;

-- add event_date (date) with a sensible default for existing rows
ALTER TABLE public.impact_reports
  ADD COLUMN IF NOT EXISTS event_date date NOT NULL DEFAULT now()::date;

-- backfill campaign_title from campaigns where available
UPDATE public.impact_reports ir
SET campaign_title = c.title
FROM public.campaigns c
WHERE ir.campaign_id IS NOT NULL
  AND c.id = ir.campaign_id
  AND (ir.campaign_title IS NULL OR ir.campaign_title = '');

-- null out campaign_id where the referenced campaign no longer exists
UPDATE public.impact_reports ir
SET campaign_id = NULL
WHERE ir.campaign_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = ir.campaign_id);

-- backfill event_date from created_at for any existing rows
UPDATE public.impact_reports
SET event_date = COALESCE(event_date, created_at::date)
WHERE event_date IS NULL;

COMMIT;
