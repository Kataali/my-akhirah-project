-- Migration: add legacy location support to impact reports
-- Generated: 2026-09-07

BEGIN;

ALTER TABLE public.impact_reports
  ADD COLUMN IF NOT EXISTS campaign_location text;

COMMIT;
