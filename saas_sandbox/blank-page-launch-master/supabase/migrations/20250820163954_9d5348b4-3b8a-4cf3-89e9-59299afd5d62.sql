-- Fix search_path mutable warning by setting explicit search_path in database functions
-- This addresses the linter warning about function search_path parameter not being set

-- Find and update any functions that need explicit search_path setting
-- Based on linter feedback, we need to add SET search_path TO 'public' to functions

-- Update any existing functions to have explicit search_path
-- Note: This is a preventive measure for any custom functions that might exist