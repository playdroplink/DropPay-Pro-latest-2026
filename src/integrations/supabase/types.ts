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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_rewards: {
        Row: {
          ad_id: string
          ad_type: string
          created_at: string
          id: string
          merchant_id: string
          reward_amount: number
          status: string
        }
        Insert: {
          ad_id: string
          ad_type: string
          created_at?: string
          id?: string
          merchant_id: string
          reward_amount?: number
          status?: string
        }
        Update: {
          ad_id?: string
          ad_type?: string
          created_at?: string
          id?: string
          merchant_id?: string
          reward_amount?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_rewards_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          merchant_id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          merchant_id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          merchant_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_responses: {
        Row: {
          created_at: string | null
          id: string
          payment_link_id: string | null
          responses: Json
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_link_id?: string | null
          responses?: Json
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_link_id?: string | null
          responses?: Json
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_responses_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_responses_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_links: {
        Row: {
          add_waitlist: boolean | null
          amount: number
          ask_questions: boolean | null
          category: string
          conversions: number | null
          created_at: string | null
          currency: string | null
          description: string
          expire_access: string | null
          features: Json | null
          id: string
          internal_name: string | null
          is_active: boolean | null
          merchant_id: string
          qr_code_data: string | null
          redirect_after_checkout: string | null
          show_on_store_page: boolean | null
          slug: string
          stock: number | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          add_waitlist?: boolean | null
          amount: number
          ask_questions?: boolean | null
          category: string
          conversions?: number | null
          created_at?: string | null
          currency?: string | null
          description: string
          expire_access?: string | null
          features?: Json | null
          id?: string
          internal_name?: string | null
          is_active?: boolean | null
          merchant_id: string
          qr_code_data?: string | null
          redirect_after_checkout?: string | null
          show_on_store_page?: boolean | null
          slug: string
          stock?: number | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          add_waitlist?: boolean | null
          amount?: number
          ask_questions?: boolean | null
          category?: string
          conversions?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string
          expire_access?: string | null
          features?: Json | null
          id?: string
          internal_name?: string | null
          is_active?: boolean | null
          merchant_id?: string
          qr_code_data?: string | null
          redirect_after_checkout?: string | null
          show_on_store_page?: boolean | null
          slug?: string
          stock?: number | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          available_balance: number | null
          business_logo: string | null
          business_name: string | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          pi_user_id: string
          pi_username: string | null
          total_withdrawn: number | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          available_balance?: number | null
          business_logo?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          pi_user_id: string
          pi_username?: string | null
          total_withdrawn?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          available_balance?: number | null
          business_logo?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          pi_user_id?: string
          pi_username?: string | null
          total_withdrawn?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          merchant_id: string
          message: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          merchant_id: string
          message: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          merchant_id?: string
          message?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          access_type: string | null
          amount: number
          ask_questions: boolean | null
          billing_interval: string | null
          checkout_questions: Json | null
          checkout_template: string | null
          content_file: string | null
          conversions: number
          created_at: string | null
          currency: string
          current_raised: number | null
          description: string | null
          discount_on_cancel: boolean | null
          discount_percent: number | null
          donor_count: number | null
          enable_split_pay: boolean | null
          enable_waitlist: boolean | null
          expire_access: string | null
          free_trial: boolean | null
          free_trial_days: number | null
          fundraising_goal: number | null
          id: string
          internal_name: string | null
          is_active: boolean | null
          is_unlimited_stock: boolean | null
          merchant_id: string
          min_amount: number | null
          payment_type: string
          plan_features: Json | null
          platform_fee_amount: number | null
          platform_fee_paid: boolean | null
          platform_fee_txid: string | null
          pricing_type: string | null
          product_images: string[] | null
          product_sku: string | null
          product_variants: Json | null
          redirect_url: string | null
          require_shipping: boolean | null
          shipping_fee: number | null
          show_on_store: boolean | null
          slug: string
          stock: number | null
          suggested_amounts: number[] | null
          tax_rate: number | null
          template_type: string | null
          title: string
          trial_days: number | null
          updated_at: string | null
          views: number
        }
        Insert: {
          access_type?: string | null
          amount: number
          ask_questions?: boolean | null
          billing_interval?: string | null
          checkout_questions?: Json | null
          checkout_template?: string | null
          content_file?: string | null
          conversions?: number
          created_at?: string | null
          currency?: string
          current_raised?: number | null
          description?: string | null
          discount_on_cancel?: boolean | null
          discount_percent?: number | null
          donor_count?: number | null
          enable_split_pay?: boolean | null
          enable_waitlist?: boolean | null
          expire_access?: string | null
          free_trial?: boolean | null
          free_trial_days?: number | null
          fundraising_goal?: number | null
          id?: string
          internal_name?: string | null
          is_active?: boolean | null
          is_unlimited_stock?: boolean | null
          merchant_id: string
          min_amount?: number | null
          payment_type?: string
          plan_features?: Json | null
          platform_fee_amount?: number | null
          platform_fee_paid?: boolean | null
          platform_fee_txid?: string | null
          pricing_type?: string | null
          product_images?: string[] | null
          product_sku?: string | null
          product_variants?: Json | null
          redirect_url?: string | null
          require_shipping?: boolean | null
          shipping_fee?: number | null
          show_on_store?: boolean | null
          slug: string
          stock?: number | null
          suggested_amounts?: number[] | null
          tax_rate?: number | null
          template_type?: string | null
          title: string
          trial_days?: number | null
          updated_at?: string | null
          views?: number
        }
        Update: {
          access_type?: string | null
          amount?: number
          ask_questions?: boolean | null
          billing_interval?: string | null
          checkout_questions?: Json | null
          checkout_template?: string | null
          content_file?: string | null
          conversions?: number
          created_at?: string | null
          currency?: string
          current_raised?: number | null
          description?: string | null
          discount_on_cancel?: boolean | null
          discount_percent?: number | null
          donor_count?: number | null
          enable_split_pay?: boolean | null
          enable_waitlist?: boolean | null
          expire_access?: string | null
          free_trial?: boolean | null
          free_trial_days?: number | null
          fundraising_goal?: number | null
          id?: string
          internal_name?: string | null
          is_active?: boolean | null
          is_unlimited_stock?: boolean | null
          merchant_id?: string
          min_amount?: number | null
          payment_type?: string
          plan_features?: Json | null
          platform_fee_amount?: number | null
          platform_fee_paid?: boolean | null
          platform_fee_txid?: string | null
          pricing_type?: string | null
          product_images?: string[] | null
          product_sku?: string | null
          product_variants?: Json | null
          redirect_url?: string | null
          require_shipping?: boolean | null
          shipping_fee?: number | null
          show_on_store?: boolean | null
          slug?: string
          stock?: number | null
          suggested_amounts?: number[] | null
          tax_rate?: number | null
          template_type?: string | null
          title?: string
          trial_days?: number | null
          updated_at?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_fees: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          merchant_id: string
          payment_link_id: string | null
          pi_payment_id: string | null
          status: string
          txid: string | null
        }
        Insert: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          merchant_id: string
          payment_link_id?: string | null
          pi_payment_id?: string | null
          status?: string
          txid?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          merchant_id?: string
          payment_link_id?: string | null
          pi_payment_id?: string | null
          status?: string
          txid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_fees_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_fees_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          amount: number
          analytics_level: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_active: boolean | null
          link_limit: number | null
          name: string
          platform_fee_percent: number | null
        }
        Insert: {
          amount: number
          analytics_level?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean | null
          link_limit?: number | null
          name: string
          platform_fee_percent?: number | null
        }
        Update: {
          amount?: number
          analytics_level?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean | null
          link_limit?: number | null
          name?: string
          platform_fee_percent?: number | null
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          ip_hash: string | null
          referrer: string | null
          tracking_link_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          tracking_link_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          tracking_link_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_tracking_link_id_fkey"
            columns: ["tracking_link_id"]
            isOneToOne: false
            referencedRelation: "tracking_links"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_links: {
        Row: {
          conversions: number | null
          created_at: string | null
          destination_url: string
          id: string
          is_active: boolean | null
          merchant_id: string
          name: string
          slug: string
          tracking_code: string | null
          updated_at: string | null
          visits: number | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string | null
          destination_url: string
          id?: string
          is_active?: boolean | null
          merchant_id: string
          name: string
          slug: string
          tracking_code?: string | null
          updated_at?: string | null
          visits?: number | null
        }
        Update: {
          conversions?: number | null
          created_at?: string | null
          destination_url?: string
          id?: string
          is_active?: boolean | null
          merchant_id?: string
          name?: string
          slug?: string
          tracking_code?: string | null
          updated_at?: string | null
          visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          blockchain_verified: boolean
          buyer_email: string | null
          completed_at: string | null
          created_at: string | null
          email_sent: boolean | null
          id: string
          memo: string | null
          merchant_id: string
          metadata: Json | null
          payer_pi_username: string | null
          payment_link_id: string | null
          pi_payment_id: string
          receiver_address: string | null
          sender_address: string | null
          status: string
          txid: string | null
        }
        Insert: {
          amount: number
          blockchain_verified?: boolean
          buyer_email?: string | null
          completed_at?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          memo?: string | null
          merchant_id: string
          metadata?: Json | null
          payer_pi_username?: string | null
          payment_link_id?: string | null
          pi_payment_id: string
          receiver_address?: string | null
          sender_address?: string | null
          status?: string
          txid?: string | null
        }
        Update: {
          amount?: number
          blockchain_verified?: boolean
          buyer_email?: string | null
          completed_at?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          memo?: string | null
          merchant_id?: string
          metadata?: Json | null
          payer_pi_username?: string | null
          payment_link_id?: string | null
          pi_payment_id?: string
          receiver_address?: string | null
          sender_address?: string | null
          status?: string
          txid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          last_payment_at: string | null
          merchant_id: string | null
          payment_link_id: string | null
          pi_username: string
          plan_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          last_payment_at?: string | null
          merchant_id?: string | null
          payment_link_id?: string | null
          pi_username: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          last_payment_at?: string | null
          merchant_id?: string | null
          payment_link_id?: string | null
          pi_username?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notified: boolean | null
          notified_at: string | null
          payment_link_id: string | null
          pi_username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          payment_link_id?: string | null
          pi_username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          payment_link_id?: string | null
          pi_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[] | null
          id: string
          is_active: boolean | null
          merchant_id: string
          secret: string
          url: string
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          merchant_id: string
          secret: string
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string
          secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          merchant_id: string
          notes: string | null
          pi_payment_id: string | null
          pi_username: string | null
          status: string
          txid: string | null
          wallet_address: string | null
          withdrawal_type: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          merchant_id: string
          notes?: string | null
          pi_payment_id?: string | null
          pi_username?: string | null
          status?: string
          txid?: string | null
          wallet_address?: string | null
          withdrawal_type?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          merchant_id?: string
          notes?: string | null
          pi_payment_id?: string | null
          pi_username?: string | null
          status?: string
          txid?: string | null
          wallet_address?: string | null
          withdrawal_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_conversions: { Args: { link_id: string }; Returns: undefined }
      increment_tracking_conversions: {
        Args: { link_id: string }
        Returns: undefined
      }
      increment_tracking_visits: {
        Args: { link_id: string }
        Returns: undefined
      }
      increment_views: { Args: { link_id: string }; Returns: undefined }
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
