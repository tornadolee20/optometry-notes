
-- Schedule nightly backup at UTC 15:00 (Taiwan 23:00)
SELECT cron.schedule(
  'nightly-auto-backup',
  '0 15 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wfaqnahahygtieyjnlji.supabase.co/functions/v1/backup-manager?action=create_backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYXFuYWhhaHlndGlleWpubGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NTU0NDUsImV4cCI6MjA3MDAzMTQ0NX0.0LuFBd95M0Wge9Oj6jfWAsNTd5FFEh1Tj52t0NtnQBo"}'::jsonb,
    body := '{"backup_type": "automatic", "backup_name": null, "include_audit_logs": true}'::jsonb
  ) AS request_id;
  $$
);
