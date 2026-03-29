-- 🔒 Fix Security Definer View Issue
-- Remove the view that was flagged as a security risk

-- Drop the problematic view
DROP VIEW IF EXISTS public.rls_performance_stats;

-- Show completion message
SELECT '✅ Security issue resolved - removed problematic view' as status;