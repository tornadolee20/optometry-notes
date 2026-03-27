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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          priority: string
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_records: {
        Row: {
          age: number
          created_at: string
          diagnostic_classification: string | null
          exam_data: Json
          exam_date: string
          follow_up_date: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          health_score: number | null
          id: string
          medical_history_simple: Json | null
          notes: string | null
          patient_code: string
          treatment_plan: string | null
          updated_at: string
          user_id: string
          va_correction_type: string | null
          va_distance_bcva_od_logmar: number | null
          va_distance_bcva_od_raw: string | null
          va_distance_bcva_os_logmar: number | null
          va_distance_bcva_os_raw: string | null
          va_distance_hc_od_logmar: number | null
          va_distance_hc_od_raw: string | null
          va_distance_hc_os_logmar: number | null
          va_distance_hc_os_raw: string | null
          va_distance_test_meters: number | null
          va_distance_ua_od_logmar: number | null
          va_distance_ua_od_raw: string | null
          va_distance_ua_os_logmar: number | null
          va_distance_ua_os_raw: string | null
          va_near_bcva_od_logmar: number | null
          va_near_bcva_od_raw: string | null
          va_near_bcva_os_logmar: number | null
          va_near_bcva_os_raw: string | null
          va_near_hc_od_logmar: number | null
          va_near_hc_od_raw: string | null
          va_near_hc_os_logmar: number | null
          va_near_hc_os_raw: string | null
          va_near_test_cm: number | null
          va_near_ua_od_logmar: number | null
          va_near_ua_od_raw: string | null
          va_near_ua_os_logmar: number | null
          va_near_ua_os_raw: string | null
          va_notes: string | null
        }
        Insert: {
          age: number
          created_at?: string
          diagnostic_classification?: string | null
          exam_data?: Json
          exam_date?: string
          follow_up_date?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          health_score?: number | null
          id?: string
          medical_history_simple?: Json | null
          notes?: string | null
          patient_code: string
          treatment_plan?: string | null
          updated_at?: string
          user_id: string
          va_correction_type?: string | null
          va_distance_bcva_od_logmar?: number | null
          va_distance_bcva_od_raw?: string | null
          va_distance_bcva_os_logmar?: number | null
          va_distance_bcva_os_raw?: string | null
          va_distance_hc_od_logmar?: number | null
          va_distance_hc_od_raw?: string | null
          va_distance_hc_os_logmar?: number | null
          va_distance_hc_os_raw?: string | null
          va_distance_test_meters?: number | null
          va_distance_ua_od_logmar?: number | null
          va_distance_ua_od_raw?: string | null
          va_distance_ua_os_logmar?: number | null
          va_distance_ua_os_raw?: string | null
          va_near_bcva_od_logmar?: number | null
          va_near_bcva_od_raw?: string | null
          va_near_bcva_os_logmar?: number | null
          va_near_bcva_os_raw?: string | null
          va_near_hc_od_logmar?: number | null
          va_near_hc_od_raw?: string | null
          va_near_hc_os_logmar?: number | null
          va_near_hc_os_raw?: string | null
          va_near_test_cm?: number | null
          va_near_ua_od_logmar?: number | null
          va_near_ua_od_raw?: string | null
          va_near_ua_os_logmar?: number | null
          va_near_ua_os_raw?: string | null
          va_notes?: string | null
        }
        Update: {
          age?: number
          created_at?: string
          diagnostic_classification?: string | null
          exam_data?: Json
          exam_date?: string
          follow_up_date?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          health_score?: number | null
          id?: string
          medical_history_simple?: Json | null
          notes?: string | null
          patient_code?: string
          treatment_plan?: string | null
          updated_at?: string
          user_id?: string
          va_correction_type?: string | null
          va_distance_bcva_od_logmar?: number | null
          va_distance_bcva_od_raw?: string | null
          va_distance_bcva_os_logmar?: number | null
          va_distance_bcva_os_raw?: string | null
          va_distance_hc_od_logmar?: number | null
          va_distance_hc_od_raw?: string | null
          va_distance_hc_os_logmar?: number | null
          va_distance_hc_os_raw?: string | null
          va_distance_test_meters?: number | null
          va_distance_ua_od_logmar?: number | null
          va_distance_ua_od_raw?: string | null
          va_distance_ua_os_logmar?: number | null
          va_distance_ua_os_raw?: string | null
          va_near_bcva_od_logmar?: number | null
          va_near_bcva_od_raw?: string | null
          va_near_bcva_os_logmar?: number | null
          va_near_bcva_os_raw?: string | null
          va_near_hc_od_logmar?: number | null
          va_near_hc_od_raw?: string | null
          va_near_hc_os_logmar?: number | null
          va_near_hc_os_raw?: string | null
          va_near_test_cm?: number | null
          va_near_ua_od_logmar?: number | null
          va_near_ua_od_raw?: string | null
          va_near_ua_os_logmar?: number | null
          va_near_ua_os_raw?: string | null
          va_notes?: string | null
        }
        Relationships: []
      }
      optometrist_profiles: {
        Row: {
          clinic_address: string
          clinic_email: string | null
          clinic_line_id: string | null
          clinic_name: string
          clinic_phone: string
          clinic_region: string
          clinic_wechat_id: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          optometrist_license_number: string | null
          optometrist_name: string
          paid_until: string
          payment_method: string
          plan_type: string
          privacy_agreed_at: string | null
          privacy_version: string | null
          professional_role: string | null
          professional_type:
            | Database["public"]["Enums"]["professional_type"]
            | null
          registration_language: string | null
          research_consent: boolean | null
          research_consent_signed: boolean
          research_qualified: boolean
          training_completed: boolean
          tw_license_number: string | null
          updated_at: string
          user_id: string
          years_of_experience: string | null
        }
        Insert: {
          clinic_address: string
          clinic_email?: string | null
          clinic_line_id?: string | null
          clinic_name: string
          clinic_phone: string
          clinic_region: string
          clinic_wechat_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          optometrist_license_number?: string | null
          optometrist_name: string
          paid_until?: string
          payment_method?: string
          plan_type?: string
          privacy_agreed_at?: string | null
          privacy_version?: string | null
          professional_role?: string | null
          professional_type?:
            | Database["public"]["Enums"]["professional_type"]
            | null
          registration_language?: string | null
          research_consent?: boolean | null
          research_consent_signed?: boolean
          research_qualified?: boolean
          training_completed?: boolean
          tw_license_number?: string | null
          updated_at?: string
          user_id: string
          years_of_experience?: string | null
        }
        Update: {
          clinic_address?: string
          clinic_email?: string | null
          clinic_line_id?: string | null
          clinic_name?: string
          clinic_phone?: string
          clinic_region?: string
          clinic_wechat_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          optometrist_license_number?: string | null
          optometrist_name?: string
          paid_until?: string
          payment_method?: string
          plan_type?: string
          privacy_agreed_at?: string | null
          privacy_version?: string | null
          professional_role?: string | null
          professional_type?:
            | Database["public"]["Enums"]["professional_type"]
            | null
          registration_language?: string | null
          research_consent?: boolean | null
          research_consent_signed?: boolean
          research_qualified?: boolean
          training_completed?: boolean
          tw_license_number?: string | null
          updated_at?: string
          user_id?: string
          years_of_experience?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_note: string | null
          amount: number
          confirmed_at: string | null
          created_at: string
          currency: string
          id: string
          note: string | null
          paid_at: string | null
          payment_provider: string
          plan_type: string
          provider_trade_no: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          paid_at?: string | null
          payment_provider?: string
          plan_type: string
          provider_trade_no?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          paid_at?: string | null
          payment_provider?: string
          plan_type?: string
          provider_trade_no?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "optometrist_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_license_unique: {
        Args: { license_number: string }
        Returns: boolean
      }
      get_subscription_status: { Args: { p_user_id: string }; Returns: string }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_payment_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_subscription_access: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "owner" | "accountant" | "support"
      gender_type: "male" | "female" | "other"
      payment_provider:
        | "bank_transfer"
        | "admin_free"
        | "newebpay"
        | "tappay"
        | "ecpay"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      professional_type:
        | "optometrist"
        | "ophthalmologist"
        | "optical_technician"
        | "other"
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
      app_role: ["admin", "user", "owner", "accountant", "support"],
      gender_type: ["male", "female", "other"],
      payment_provider: [
        "bank_transfer",
        "admin_free",
        "newebpay",
        "tappay",
        "ecpay",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      professional_type: [
        "optometrist",
        "ophthalmologist",
        "optical_technician",
        "other",
      ],
    },
  },
} as const
