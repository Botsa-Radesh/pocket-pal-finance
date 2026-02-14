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
      bills: {
        Row: {
          amount: number
          category: string
          created_at: string
          due_day: number
          frequency: string
          id: string
          is_active: boolean
          last_paid_date: string | null
          name: string
          next_due_date: string
          notes: string | null
          reminder_days_before: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          due_day: number
          frequency: string
          id?: string
          is_active?: boolean
          last_paid_date?: string | null
          name: string
          next_due_date: string
          notes?: string | null
          reminder_days_before?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          due_day?: number
          frequency?: string
          id?: string
          is_active?: boolean
          last_paid_date?: string | null
          name?: string
          next_due_date?: string
          notes?: string | null
          reminder_days_before?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category: string
          created_at: string | null
          id: string
          limit_amount: number
          spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          limit_amount: number
          spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          limit_amount?: number
          spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_reviews: {
        Row: {
          analysis_id: string
          corrected_conditions: Json | null
          created_at: string
          expert_id: string
          id: string
          notes: string | null
          original_conditions: Json
          validation_status: string
        }
        Insert: {
          analysis_id: string
          corrected_conditions?: Json | null
          created_at?: string
          expert_id: string
          id?: string
          notes?: string | null
          original_conditions?: Json
          validation_status: string
        }
        Update: {
          analysis_id?: string
          corrected_conditions?: Json | null
          created_at?: string
          expert_id?: string
          id?: string
          notes?: string | null
          original_conditions?: Json
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_reviews_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "skin_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_reviews_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lifestyle_profiles: {
        Row: {
          alcohol_frequency: string | null
          city: string | null
          climate_type: string | null
          created_at: string
          diet_type: string | null
          exercise_frequency: string | null
          id: string
          sleep_hours: number | null
          smoking: boolean | null
          stress_level: number | null
          sun_exposure_hours: number | null
          updated_at: string
          user_id: string
          water_intake_liters: number | null
        }
        Insert: {
          alcohol_frequency?: string | null
          city?: string | null
          climate_type?: string | null
          created_at?: string
          diet_type?: string | null
          exercise_frequency?: string | null
          id?: string
          sleep_hours?: number | null
          smoking?: boolean | null
          stress_level?: number | null
          sun_exposure_hours?: number | null
          updated_at?: string
          user_id: string
          water_intake_liters?: number | null
        }
        Update: {
          alcohol_frequency?: string | null
          city?: string | null
          climate_type?: string | null
          created_at?: string
          diet_type?: string | null
          exercise_frequency?: string | null
          id?: string
          sleep_hours?: number | null
          smoking?: boolean | null
          stress_level?: number | null
          sun_exposure_hours?: number | null
          updated_at?: string
          user_id?: string
          water_intake_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lifestyle_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          monthly_income: number | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          monthly_income?: number | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          analysis_id: string
          avoid_ingredients: Json
          category: string
          concern: string
          created_at: string
          formulation_type: string
          id: string
          priority: number
          product_suggestions: Json
          reasoning: string
          suggested_ingredients: Json
          user_id: string
        }
        Insert: {
          analysis_id: string
          avoid_ingredients?: Json
          category: string
          concern: string
          created_at?: string
          formulation_type: string
          id?: string
          priority?: number
          product_suggestions?: Json
          reasoning: string
          suggested_ingredients?: Json
          user_id: string
        }
        Update: {
          analysis_id?: string
          avoid_ingredients?: Json
          category?: string
          concern?: string
          created_at?: string
          formulation_type?: string
          id?: string
          priority?: number
          product_suggestions?: Json
          reasoning?: string
          suggested_ingredients?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "skin_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skin_analyses: {
        Row: {
          ai_confidence: number
          analysis_type: string
          conditions: Json
          created_at: string
          expert_notes: string | null
          expert_reviewed: boolean
          id: string
          image_url: string
          reviewed_by: string | null
          severity_scores: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number
          analysis_type: string
          conditions?: Json
          created_at?: string
          expert_notes?: string | null
          expert_reviewed?: boolean
          id?: string
          image_url: string
          reviewed_by?: string | null
          severity_scores?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number
          analysis_type?: string
          conditions?: Json
          created_at?: string
          expert_notes?: string | null
          expert_reviewed?: boolean
          id?: string
          image_url?: string
          reviewed_by?: string | null
          severity_scores?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skin_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_due_date: {
        Args: {
          p_due_day: number
          p_frequency: string
          p_last_paid_date: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
