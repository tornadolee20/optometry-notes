-- Phase 1a: Add enum values first
-- Add missing role values to existing app_role enum

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';