
-- =====================================================
-- Convert ALL restrictive-only RLS policies to PERMISSIVE
-- and remove anon SELECT on stores to prevent PII leakage
-- =====================================================

-- ── activity_logs ──
DROP POLICY IF EXISTS "System can create activity logs" ON public.activity_logs;
CREATE POLICY "System can create activity logs" ON public.activity_logs FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "activity_logs_select_policy" ON public.activity_logs;
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs FOR SELECT TO authenticated USING (
  is_super_admin() OR (performed_by = (auth.uid())::text) OR (entity_type = 'store' AND entity_id IN (SELECT id::text FROM stores WHERE user_id = auth.uid()))
);

-- ── admins ──
DROP POLICY IF EXISTS "Super admins only" ON public.admins;
CREATE POLICY "Super admins only" ON public.admins FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── backup_schedules ──
DROP POLICY IF EXISTS "Super admins can manage backup schedules" ON public.backup_schedules;
CREATE POLICY "Super admins can manage backup schedules" ON public.backup_schedules FOR ALL TO authenticated USING (is_super_admin());

-- ── bank_transfer_submissions ──
DROP POLICY IF EXISTS "transfer_submissions_delete_policy" ON public.bank_transfer_submissions;
CREATE POLICY "transfer_submissions_delete_policy" ON public.bank_transfer_submissions FOR DELETE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "transfer_submissions_insert_policy" ON public.bank_transfer_submissions;
CREATE POLICY "transfer_submissions_insert_policy" ON public.bank_transfer_submissions FOR INSERT TO authenticated WITH CHECK (
  is_super_admin() OR EXISTS (SELECT 1 FROM stores s WHERE s.id = bank_transfer_submissions.store_id AND s.user_id = auth.uid())
);

DROP POLICY IF EXISTS "transfer_submissions_select_policy" ON public.bank_transfer_submissions;
CREATE POLICY "transfer_submissions_select_policy" ON public.bank_transfer_submissions FOR SELECT TO authenticated USING (
  is_super_admin() OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM stores s WHERE s.id = bank_transfer_submissions.store_id AND s.user_id = auth.uid())
);

DROP POLICY IF EXISTS "transfer_submissions_update_policy" ON public.bank_transfer_submissions;
CREATE POLICY "transfer_submissions_update_policy" ON public.bank_transfer_submissions FOR UPDATE TO authenticated USING (
  is_super_admin() OR has_role(auth.uid(), 'admin'::app_role)
) WITH CHECK (
  is_super_admin() OR has_role(auth.uid(), 'admin'::app_role)
);

-- ── customer_acquisition_funnel ──
DROP POLICY IF EXISTS "Super admins can manage customer_acquisition_funnel" ON public.customer_acquisition_funnel;
CREATE POLICY "Super admins can manage customer_acquisition_funnel" ON public.customer_acquisition_funnel FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── customer_behavior_metrics ──
DROP POLICY IF EXISTS "Super admins can manage customer_behavior_metrics" ON public.customer_behavior_metrics;
CREATE POLICY "Super admins can manage customer_behavior_metrics" ON public.customer_behavior_metrics FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── customer_keyword_logs ──
DROP POLICY IF EXISTS "customer_keyword_logs_insert_policy" ON public.customer_keyword_logs;
CREATE POLICY "customer_keyword_logs_insert_policy" ON public.customer_keyword_logs FOR INSERT TO authenticated, anon WITH CHECK (
  is_super_admin() OR (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())) OR (auth.uid() IS NULL AND is_subscription_active(store_id))
);

DROP POLICY IF EXISTS "customer_keyword_logs_select_policy" ON public.customer_keyword_logs;
CREATE POLICY "customer_keyword_logs_select_policy" ON public.customer_keyword_logs FOR SELECT TO authenticated, anon USING (
  is_super_admin() OR (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())) OR (auth.uid() IS NULL AND is_subscription_active(store_id))
);

-- ── daily_business_metrics ──
DROP POLICY IF EXISTS "Super admins can manage daily_business_metrics" ON public.daily_business_metrics;
CREATE POLICY "Super admins can manage daily_business_metrics" ON public.daily_business_metrics FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── disaster_recovery_events ──
DROP POLICY IF EXISTS "Super admins can view all recovery events" ON public.disaster_recovery_events;
CREATE POLICY "Super admins can view all recovery events" ON public.disaster_recovery_events FOR ALL TO authenticated USING (is_super_admin());

-- ── function_usage_logs ──
DROP POLICY IF EXISTS "System can manage function usage logs" ON public.function_usage_logs;
CREATE POLICY "System can manage function usage logs" ON public.function_usage_logs FOR ALL USING (auth.role() = 'service_role');

-- ── industry_analytics ──
DROP POLICY IF EXISTS "Super admins can manage industry_analytics" ON public.industry_analytics;
CREATE POLICY "Super admins can manage industry_analytics" ON public.industry_analytics FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── industry_keywords ──
DROP POLICY IF EXISTS "Allow read access to industry_keywords" ON public.industry_keywords;
CREATE POLICY "Allow read access to industry_keywords" ON public.industry_keywords FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "industry_keywords_delete_admin" ON public.industry_keywords;
CREATE POLICY "industry_keywords_delete_admin" ON public.industry_keywords FOR DELETE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "industry_keywords_insert_admin" ON public.industry_keywords;
CREATE POLICY "industry_keywords_insert_admin" ON public.industry_keywords FOR INSERT TO authenticated WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "industry_keywords_update_admin" ON public.industry_keywords;
CREATE POLICY "industry_keywords_update_admin" ON public.industry_keywords FOR UPDATE TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── industry_templates ──
DROP POLICY IF EXISTS "Anyone can read active templates" ON public.industry_templates;
CREATE POLICY "Anyone can read active templates" ON public.industry_templates FOR SELECT TO authenticated, anon USING (is_active = true);

DROP POLICY IF EXISTS "Super admins can manage templates" ON public.industry_templates;
CREATE POLICY "Super admins can manage templates" ON public.industry_templates FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── login_attempts ──
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
CREATE POLICY "Admins can view login attempts" ON public.login_attempts FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "System can track login attempts" ON public.login_attempts;
CREATE POLICY "System can track login attempts" ON public.login_attempts FOR INSERT TO authenticated, anon WITH CHECK (true);

-- ── monitoring_alerts ──
DROP POLICY IF EXISTS "Admins can read monitoring alerts" ON public.monitoring_alerts;
CREATE POLICY "Admins can read monitoring alerts" ON public.monitoring_alerts FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "monitoring_alerts_insert_system" ON public.monitoring_alerts;
CREATE POLICY "monitoring_alerts_insert_system" ON public.monitoring_alerts FOR INSERT TO authenticated WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "monitoring_alerts_update_system" ON public.monitoring_alerts;
CREATE POLICY "monitoring_alerts_update_system" ON public.monitoring_alerts FOR UPDATE TO authenticated USING (is_super_admin() OR auth.role() = 'service_role') WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

-- ── monitoring_metrics ──
DROP POLICY IF EXISTS "Admins can read monitoring metrics" ON public.monitoring_metrics;
CREATE POLICY "Admins can read monitoring metrics" ON public.monitoring_metrics FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "monitoring_metrics_insert_system" ON public.monitoring_metrics;
CREATE POLICY "monitoring_metrics_insert_system" ON public.monitoring_metrics FOR INSERT TO authenticated WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

-- ── payment_audit_log ──
DROP POLICY IF EXISTS "Super admins can view payment audit logs" ON public.payment_audit_log;
CREATE POLICY "Super admins can view payment audit logs" ON public.payment_audit_log FOR ALL TO authenticated USING (is_super_admin());

-- ── payment_transactions ──
DROP POLICY IF EXISTS "payment_transactions_insert_policy" ON public.payment_transactions;
CREATE POLICY "payment_transactions_insert_policy" ON public.payment_transactions FOR INSERT TO authenticated WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "payment_transactions_select_policy" ON public.payment_transactions;
CREATE POLICY "payment_transactions_select_policy" ON public.payment_transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM stores s WHERE s.id = payment_transactions.store_id AND (s.user_id = auth.uid() OR is_super_admin()))
);

-- ── store_audit_log ──
DROP POLICY IF EXISTS "Super admins can view store audit logs" ON public.store_audit_log;
CREATE POLICY "Super admins can view store audit logs" ON public.store_audit_log FOR ALL TO authenticated USING (is_super_admin());

-- ── store_keywords ──
DROP POLICY IF EXISTS "Public can view keywords of active stores only" ON public.store_keywords;
CREATE POLICY "Public can view keywords of active stores only" ON public.store_keywords FOR SELECT TO authenticated, anon USING (
  (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_keywords.store_id AND s.user_id = auth.uid())) OR is_super_admin() OR (auth.uid() IS NULL AND is_subscription_active(store_id))
);

DROP POLICY IF EXISTS "store_keywords_delete_owner_with_active_subscription_or_admin" ON public.store_keywords;
CREATE POLICY "store_keywords_delete_owner_with_active_subscription_or_admin" ON public.store_keywords FOR DELETE TO authenticated USING (
  (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_keywords.store_id AND s.user_id = auth.uid()) AND is_subscription_active(store_id)) OR is_super_admin()
);

DROP POLICY IF EXISTS "store_keywords_insert_owner_with_active_subscription_or_admin" ON public.store_keywords;
CREATE POLICY "store_keywords_insert_owner_with_active_subscription_or_admin" ON public.store_keywords FOR INSERT TO authenticated WITH CHECK (
  (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_keywords.store_id AND s.user_id = auth.uid()) AND is_subscription_active(store_id)) OR is_super_admin()
);

DROP POLICY IF EXISTS "store_keywords_update_owner_with_active_subscription_or_admin" ON public.store_keywords;
CREATE POLICY "store_keywords_update_owner_with_active_subscription_or_admin" ON public.store_keywords FOR UPDATE TO authenticated USING (
  (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_keywords.store_id AND s.user_id = auth.uid()) AND is_subscription_active(store_id)) OR is_super_admin()
) WITH CHECK (
  (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_keywords.store_id AND s.user_id = auth.uid()) AND is_subscription_active(store_id)) OR is_super_admin()
);

-- ── store_subscriptions ──
DROP POLICY IF EXISTS "store_subscriptions_delete_admin" ON public.store_subscriptions;
CREATE POLICY "store_subscriptions_delete_admin" ON public.store_subscriptions FOR DELETE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "store_subscriptions_insert_admin" ON public.store_subscriptions;
CREATE POLICY "store_subscriptions_insert_admin" ON public.store_subscriptions FOR INSERT TO authenticated WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "store_subscriptions_select_policy" ON public.store_subscriptions;
CREATE POLICY "store_subscriptions_select_policy" ON public.store_subscriptions FOR SELECT TO authenticated USING (
  is_super_admin() OR EXISTS (SELECT 1 FROM stores s WHERE s.id = store_subscriptions.store_id AND s.user_id = auth.uid())
);

DROP POLICY IF EXISTS "store_subscriptions_update_admin" ON public.store_subscriptions;
CREATE POLICY "store_subscriptions_update_admin" ON public.store_subscriptions FOR UPDATE TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── stores ──
-- Remove duplicate and the PII-exposing anon policy
DROP POLICY IF EXISTS "Store owners and admins can view stores" ON public.stores;
DROP POLICY IF EXISTS "stores_select_owner_or_admin" ON public.stores;
DROP POLICY IF EXISTS "stores_select_public_active_subscription" ON public.stores;
DROP POLICY IF EXISTS "Super admins can delete stores" ON public.stores;
DROP POLICY IF EXISTS "stores_insert_policy" ON public.stores;
DROP POLICY IF EXISTS "stores_update_policy" ON public.stores;

-- Authenticated owner/admin SELECT (no anon direct access - use get_store_for_review RPC)
CREATE POLICY "stores_select_owner_or_admin" ON public.stores FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR is_super_admin()
);

CREATE POLICY "stores_insert_policy" ON public.stores FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "stores_update_policy" ON public.stores FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR is_super_admin()
) WITH CHECK (
  user_id = auth.uid() OR is_super_admin()
);

CREATE POLICY "Super admins can delete stores" ON public.stores FOR DELETE TO authenticated USING (is_super_admin());

-- ── subscription_audit_log ──
DROP POLICY IF EXISTS "Super admins can view subscription audit logs" ON public.subscription_audit_log;
CREATE POLICY "Super admins can view subscription audit logs" ON public.subscription_audit_log FOR ALL TO authenticated USING (is_super_admin());

-- ── system_backups ──
DROP POLICY IF EXISTS "Super admins can manage all backup data" ON public.system_backups;
CREATE POLICY "Super admins can manage all backup data" ON public.system_backups FOR ALL TO authenticated USING (is_super_admin());

-- ── system_health_logs ──
DROP POLICY IF EXISTS "Super admins can view all health logs" ON public.system_health_logs;
CREATE POLICY "Super admins can view all health logs" ON public.system_health_logs FOR ALL TO authenticated USING (is_super_admin());

-- ── system_logs ──
DROP POLICY IF EXISTS "Admins can view system logs" ON public.system_logs;
CREATE POLICY "Admins can view system logs" ON public.system_logs FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "System can create logs" ON public.system_logs;
CREATE POLICY "System can create logs" ON public.system_logs FOR INSERT TO authenticated, anon WITH CHECK (true);

-- ── system_settings ──
DROP POLICY IF EXISTS "Only admins can insert system settings" ON public.system_settings;
CREATE POLICY "Only admins can insert system settings" ON public.system_settings FOR INSERT TO authenticated WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;
CREATE POLICY "Only admins can update system settings" ON public.system_settings FOR UPDATE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "Only admins can view system settings" ON public.system_settings;
CREATE POLICY "Only admins can view system settings" ON public.system_settings FOR SELECT TO authenticated USING (is_super_admin());

-- ── user_roles ──
DROP POLICY IF EXISTS "user_roles_delete_super_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_super_admin" ON public.user_roles FOR DELETE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "user_roles_insert_super_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_super_admin" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_roles_update_super_admin" ON public.user_roles;
CREATE POLICY "user_roles_update_super_admin" ON public.user_roles FOR UPDATE TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ── user_sessions ──
DROP POLICY IF EXISTS "user_sessions_policy" ON public.user_sessions;
CREATE POLICY "user_sessions_policy" ON public.user_sessions FOR ALL TO authenticated USING (user_id = auth.uid() OR is_super_admin()) WITH CHECK (user_id = auth.uid() OR is_super_admin());

-- ── users ──
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON public.users;
CREATE POLICY "Users can insert their own profile during registration" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT u.role FROM users u WHERE u.id = auth.uid()));

DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin" ON public.users FOR SELECT TO authenticated USING (is_super_admin() OR id = auth.uid());
