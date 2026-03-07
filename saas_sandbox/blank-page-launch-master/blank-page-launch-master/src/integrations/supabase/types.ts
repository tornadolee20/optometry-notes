export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      backup_schedules: {
        Row: {
          backup_config: Json | null
          backup_type: string
          created_at: string
          cron_expression: string
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          notification_settings: Json | null
          retention_days: number
          schedule_name: string
          updated_at: string
        }
        Insert: {
          backup_config?: Json | null
          backup_type?: string
          created_at?: string
          cron_expression: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notification_settings?: Json | null
          retention_days?: number
          schedule_name: string
          updated_at?: string
        }
        Update: {
          backup_config?: Json | null
          backup_type?: string
          created_at?: string
          cron_expression?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notification_settings?: Json | null
          retention_days?: number
          schedule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_transfer_submissions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          status: string
          store_id: string
          submitted_by: string | null
          transfer_code: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          status?: string
          store_id: string
          submitted_by?: string | null
          transfer_code: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          status?: string
          store_id?: string
          submitted_by?: string | null
          transfer_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transfer_submissions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_acquisition_funnel: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          date: string
          id: string
          paid_conversions: number | null
          period_type: string
          signups: number | null
          trial_starts: number | null
          visitors: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          paid_conversions?: number | null
          period_type: string
          signups?: number | null
          trial_starts?: number | null
          visitors?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          paid_conversions?: number | null
          period_type?: string
          signups?: number | null
          trial_starts?: number | null
          visitors?: number | null
        }
        Relationships: []
      }
      customer_behavior_metrics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          keywords_selected: number | null
          reviews_generated: number | null
          session_id: string | null
          store_id: string | null
          time_spent_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          keywords_selected?: number | null
          reviews_generated?: number | null
          session_id?: string | null
          store_id?: string | null
          time_spent_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          keywords_selected?: number | null
          reviews_generated?: number | null
          session_id?: string | null
          store_id?: string | null
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_behavior_metrics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_keyword_logs: {
        Row: {
          created_at: string
          custom_feelings: string[] | null
          id: string
          selected_keywords: string[] | null
          store_id: string | null
        }
        Insert: {
          created_at?: string
          custom_feelings?: string[] | null
          id?: string
          selected_keywords?: string[] | null
          store_id?: string | null
        }
        Update: {
          created_at?: string
          custom_feelings?: string[] | null
          id?: string
          selected_keywords?: string[] | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_keyword_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_business_metrics: {
        Row: {
          average_keywords_per_session: number | null
          average_reviews_per_customer: number | null
          created_at: string | null
          date: string
          id: string
          new_stores_count: number | null
          new_subscriptions_count: number | null
          total_active_stores: number | null
          total_keyword_selections: number | null
          total_review_generations: number | null
          updated_at: string | null
        }
        Insert: {
          average_keywords_per_session?: number | null
          average_reviews_per_customer?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_stores_count?: number | null
          new_subscriptions_count?: number | null
          total_active_stores?: number | null
          total_keyword_selections?: number | null
          total_review_generations?: number | null
          updated_at?: string | null
        }
        Update: {
          average_keywords_per_session?: number | null
          average_reviews_per_customer?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_stores_count?: number | null
          new_subscriptions_count?: number | null
          total_active_stores?: number | null
          total_keyword_selections?: number | null
          total_review_generations?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      disaster_recovery_events: {
        Row: {
          after_state: Json | null
          backup_id: string | null
          before_state: Json | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          event_status: string
          event_type: string
          execution_time_ms: number | null
          id: string
          recovery_steps: string[] | null
          trigger_reason: string | null
          triggered_by: string | null
        }
        Insert: {
          after_state?: Json | null
          backup_id?: string | null
          before_state?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          event_status: string
          event_type: string
          execution_time_ms?: number | null
          id?: string
          recovery_steps?: string[] | null
          trigger_reason?: string | null
          triggered_by?: string | null
        }
        Update: {
          after_state?: Json | null
          backup_id?: string | null
          before_state?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          event_status?: string
          event_type?: string
          execution_time_ms?: number | null
          id?: string
          recovery_steps?: string[] | null
          trigger_reason?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disaster_recovery_events_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "system_backups"
            referencedColumns: ["id"]
          },
        ]
      }
      function_usage_logs: {
        Row: {
          created_at: string
          function_name: string
          id: string
          ip_address: unknown
          last_request_at: string
          origin: string | null
          request_count: number
          user_agent: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          ip_address?: unknown
          last_request_at?: string
          origin?: string | null
          request_count?: number
          user_agent?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          ip_address?: unknown
          last_request_at?: string
          origin?: string | null
          request_count?: number
          user_agent?: string | null
          window_start?: string
        }
        Relationships: []
      }
      industry_analytics: {
        Row: {
          active_stores: number | null
          avg_keyword_usage: number | null
          avg_subscription_duration: number | null
          id: string
          industry: string
          last_updated: string | null
          total_stores: number | null
        }
        Insert: {
          active_stores?: number | null
          avg_keyword_usage?: number | null
          avg_subscription_duration?: number | null
          id?: string
          industry: string
          last_updated?: string | null
          total_stores?: number | null
        }
        Update: {
          active_stores?: number | null
          avg_keyword_usage?: number | null
          avg_subscription_duration?: number | null
          id?: string
          industry?: string
          last_updated?: string | null
          total_stores?: number | null
        }
        Relationships: []
      }
      industry_keywords: {
        Row: {
          frequency: number | null
          id: string
          industry: string
          keyword: string
          last_updated: string
          usage_count: number | null
        }
        Insert: {
          frequency?: number | null
          id?: string
          industry: string
          keyword: string
          last_updated?: string
          usage_count?: number | null
        }
        Update: {
          frequency?: number | null
          id?: string
          industry?: string
          keyword?: string
          last_updated?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address: unknown
          success: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      monitoring_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          is_active: boolean
          message: string
          metadata: Json
          resolved_at: string | null
          severity: string
          source: string
          title: string
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id: string
          is_active?: boolean
          message: string
          metadata?: Json
          resolved_at?: string | null
          severity: string
          source: string
          title: string
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          metadata?: Json
          resolved_at?: string | null
          severity?: string
          source?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      monitoring_metrics: {
        Row: {
          id: string
          name: string
          tags: Json
          timestamp: string
          unit: string
          value: number
        }
        Insert: {
          id?: string
          name: string
          tags?: Json
          timestamp?: string
          unit: string
          value: number
        }
        Update: {
          id?: string
          name?: string
          tags?: Json
          timestamp?: string
          unit?: string
          value?: number
        }
        Relationships: []
      }
      payment_audit_log: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation_type: string
          transaction_id: string
          user_agent: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_type: string
          transaction_id: string
          user_agent?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_type?: string
          transaction_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          status: string
          store_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          status: string
          store_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          store_id?: string | null
        }
        Relationships: []
      }
      store_audit_log: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation_type: string
          store_id: string
          user_agent: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_type: string
          store_id: string
          user_agent?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_type?: string
          store_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      store_keywords: {
        Row: {
          category: Database["public"]["Enums"]["keyword_category"] | null
          created_at: string
          id: string
          industry: string | null
          is_primary: boolean | null
          keyword: string
          priority: number | null
          source: string | null
          store_id: string | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["keyword_category"] | null
          created_at?: string
          id?: string
          industry?: string | null
          is_primary?: boolean | null
          keyword: string
          priority?: number | null
          source?: string | null
          store_id?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["keyword_category"] | null
          created_at?: string
          id?: string
          industry?: string | null
          is_primary?: boolean | null
          keyword?: string
          priority?: number | null
          source?: string | null
          store_id?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_keywords_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          expires_at: string
          features: Json | null
          id: string
          payment_source: string | null
          plan_type: string
          status: string | null
          store_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          expires_at: string
          features?: Json | null
          id?: string
          payment_source?: string | null
          plan_type?: string
          status?: string | null
          store_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          expires_at?: string
          features?: Json | null
          id?: string
          payment_source?: string | null
          plan_type?: string
          status?: string | null
          store_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          created_at: string
          description: string | null
          email: string
          google_review_url: string | null
          id: string
          industry: string | null
          phone: string
          status: Database["public"]["Enums"]["store_status"] | null
          store_name: string
          store_number: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          email: string
          google_review_url?: string | null
          id?: string
          industry?: string | null
          phone: string
          status?: Database["public"]["Enums"]["store_status"] | null
          store_name: string
          store_number?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          email?: string
          google_review_url?: string | null
          id?: string
          industry?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["store_status"] | null
          store_name?: string
          store_number?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_audit_log: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation_type: string
          store_id: string
          user_agent: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_type: string
          store_id: string
          user_agent?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation_type?: string
          store_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_metadata: Json | null
          backup_name: string
          backup_status: string
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          database_snapshot_id: string | null
          encryption_key_hash: string | null
          expires_at: string | null
          file_path: string | null
          file_size: number | null
          git_branch: string | null
          git_commit_hash: string | null
          id: string
          notes: string | null
          verification_checksum: string | null
        }
        Insert: {
          backup_metadata?: Json | null
          backup_name: string
          backup_status?: string
          backup_type: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          database_snapshot_id?: string | null
          encryption_key_hash?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          git_branch?: string | null
          git_commit_hash?: string | null
          id?: string
          notes?: string | null
          verification_checksum?: string | null
        }
        Update: {
          backup_metadata?: Json | null
          backup_name?: string
          backup_status?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          database_snapshot_id?: string | null
          encryption_key_hash?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          git_branch?: string | null
          git_commit_hash?: string | null
          id?: string
          notes?: string | null
          verification_checksum?: string | null
        }
        Relationships: []
      }
      system_health_logs: {
        Row: {
          build_check: boolean
          check_timestamp: string
          database_connectivity: boolean
          dependency_check: boolean
          environment: string | null
          error_details: Json | null
          file_integrity_check: boolean
          id: string
          overall_health_score: number
          recommendations: string[] | null
          response_time_ms: number | null
          triggered_by: string | null
          typescript_check: boolean
        }
        Insert: {
          build_check?: boolean
          check_timestamp?: string
          database_connectivity?: boolean
          dependency_check?: boolean
          environment?: string | null
          error_details?: Json | null
          file_integrity_check?: boolean
          id?: string
          overall_health_score: number
          recommendations?: string[] | null
          response_time_ms?: number | null
          triggered_by?: string | null
          typescript_check?: boolean
        }
        Update: {
          build_check?: boolean
          check_timestamp?: string
          database_connectivity?: boolean
          dependency_check?: boolean
          environment?: string | null
          error_details?: Json | null
          file_integrity_check?: boolean
          id?: string
          overall_health_score?: number
          recommendations?: string[] | null
          response_time_ms?: number | null
          triggered_by?: string | null
          typescript_check?: boolean
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          category: string | null
          details: Json | null
          id: string
          level: string | null
          message: string | null
          sessionid: string | null
          source: string | null
          stack: string | null
          timestamp: string | null
          url: string | null
          useragent: string | null
          userid: string | null
        }
        Insert: {
          category?: string | null
          details?: Json | null
          id?: string
          level?: string | null
          message?: string | null
          sessionid?: string | null
          source?: string | null
          stack?: string | null
          timestamp?: string | null
          url?: string | null
          useragent?: string | null
          userid?: string | null
        }
        Update: {
          category?: string | null
          details?: Json | null
          id?: string
          level?: string | null
          message?: string | null
          sessionid?: string | null
          source?: string | null
          stack?: string | null
          timestamp?: string | null
          url?: string | null
          useragent?: string | null
          userid?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_activity_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_grant_free_subscription: {
        Args: {
          _auto_renew?: boolean
          _duration_days: number
          _notes?: string
          _reason?: string
          _store_id: string
        }
        Returns: {
          auto_renew: boolean
          expires_at: string
          plan_type: string
          status: string
          store_id: string
          trial_ends_at: string
        }[]
      }
      calculate_daily_metrics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      calculate_system_health: { Args: never; Returns: number }
      cleanup_function_usage_logs: { Args: never; Returns: undefined }
      cleanup_old_backups: { Args: never; Returns: undefined }
      get_critical_backup_data: {
        Args: never
        Returns: {
          data_json: Json
          row_count: number
          table_name: string
        }[]
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_store_for_review: {
        Args: { store_number_param: number }
        Returns: {
          address: string
          created_at: string
          description: string
          email: string
          google_review_url: string
          id: string
          industry: string
          phone: string
          status: Database["public"]["Enums"]["store_status"]
          store_name: string
          store_number: number
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_subscription_active: { Args: { _store_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      schedule_automatic_backup: {
        Args: { _backup_type?: string }
        Returns: {
          backup_id: string
          backup_type: string
          scheduled_at: string
        }[]
      }
    }
    Enums: {
      app_role: "user" | "admin" | "store_owner" | "super_admin" | "manager"
      keyword_category:
        | "general"
        | "product"
        | "service"
        | "location"
        | "experience"
      store_status: "pending" | "active" | "suspended" | "cancelled"
      subscription_plan_type: "trial" | "monthly" | "quarterly" | "yearly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "store_owner", "super_admin", "manager"],
      keyword_category: [
        "general",
        "product",
        "service",
        "location",
        "experience",
      ],
      store_status: ["pending", "active", "suspended", "cancelled"],
      subscription_plan_type: ["trial", "monthly", "quarterly", "yearly"],
    },
  },
} as const
