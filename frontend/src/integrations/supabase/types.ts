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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      calendar_sync_settings: {
        Row: {
          auto_sync: boolean | null
          caldav_enabled: boolean | null
          caldav_username: string | null
          conflict_resolution: string | null
          created_at: string | null
          last_sync: string | null
          sync_frequency: number | null
          sync_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_sync?: boolean | null
          caldav_enabled?: boolean | null
          caldav_username?: string | null
          conflict_resolution?: string | null
          created_at?: string | null
          last_sync?: string | null
          sync_frequency?: number | null
          sync_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_sync?: boolean | null
          caldav_enabled?: boolean | null
          caldav_username?: string | null
          conflict_resolution?: string | null
          created_at?: string | null
          last_sync?: string | null
          sync_frequency?: number | null
          sync_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          file_name: string
          id: string
          mime_type: string | null
          original_name: string | null
          storage_path: string
          trip_id: string | null
          trip_item_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          storage_path: string
          trip_id?: string | null
          trip_item_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          storage_path?: string
          trip_id?: string | null
          trip_item_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_trip_item_id_fkey"
            columns: ["trip_item_id"]
            isOneToOne: false
            referencedRelation: "trip_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          deleted: boolean
          deleted_at: string | null
          deletion_synced_at: string | null
          description: string | null
          end_datetime: string | null
          event_datetime: string
          google_calendar_id: string | null
          google_etag: string | null
          google_event_id: string | null
          id: string
          is_conflict: boolean
          last_synced_at: string | null
          local_modified_at: string | null
          location: string | null
          recurrence_exceptions: string[] | null
          recurrence_overrides: Json | null
          recurrence_rule: string | null
          remote_modified_at: string | null
          status: string | null
          sync_attempts: number
          sync_error: string | null
          sync_source: string
          sync_status: string
          timezone: string | null
          title: string | null
          trip_id: string | null
          type: string
          user_id: string
          whatsapp_group_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          deleted?: boolean
          deleted_at?: string | null
          deletion_synced_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_datetime: string
          google_calendar_id?: string | null
          google_etag?: string | null
          google_event_id?: string | null
          id?: string
          is_conflict?: boolean
          last_synced_at?: string | null
          local_modified_at?: string | null
          location?: string | null
          recurrence_exceptions?: string[] | null
          recurrence_overrides?: Json | null
          recurrence_rule?: string | null
          remote_modified_at?: string | null
          status?: string | null
          sync_attempts?: number
          sync_error?: string | null
          sync_source?: string
          sync_status?: string
          timezone?: string | null
          title?: string | null
          trip_id?: string | null
          type: string
          user_id: string
          whatsapp_group_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          deleted?: boolean
          deleted_at?: string | null
          deletion_synced_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_datetime?: string
          google_calendar_id?: string | null
          google_etag?: string | null
          google_event_id?: string | null
          id?: string
          is_conflict?: boolean
          last_synced_at?: string | null
          local_modified_at?: string | null
          location?: string | null
          recurrence_exceptions?: string[] | null
          recurrence_overrides?: Json | null
          recurrence_rule?: string | null
          remote_modified_at?: string | null
          status?: string | null
          sync_attempts?: number
          sync_error?: string | null
          sync_source?: string
          sync_status?: string
          timezone?: string | null
          title?: string | null
          trip_id?: string | null
          type?: string
          user_id?: string
          whatsapp_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_whatsapp_group_id_fkey"
            columns: ["whatsapp_group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_log: {
        Row: {
          channel: string | null
          id: string
          message: string | null
          recipient_user_id: string | null
          reminder_id: string | null
          sent_at: string | null
        }
        Insert: {
          channel?: string | null
          id?: string
          message?: string | null
          recipient_user_id?: string | null
          reminder_id?: string | null
          sent_at?: string | null
        }
        Update: {
          channel?: string | null
          id?: string
          message?: string | null
          recipient_user_id?: string | null
          reminder_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_log_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          category: string | null
          created_at: string | null
          details: string | null
          document_url: string | null
          email_id: string | null
          expense_date: string | null
          file_name: string
          id: string
          mime_type: string | null
          received_date: string | null
          status: string | null
          storage_path: string
          total_amount: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          details?: string | null
          document_url?: string | null
          email_id?: string | null
          expense_date?: string | null
          file_name: string
          id?: string
          mime_type?: string | null
          received_date?: string | null
          status?: string | null
          storage_path: string
          total_amount?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          details?: string | null
          document_url?: string | null
          email_id?: string | null
          expense_date?: string | null
          file_name?: string
          id?: string
          mime_type?: string | null
          received_date?: string | null
          status?: string | null
          storage_path?: string
          total_amount?: string | null
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          has_due_date: boolean | null
          id: string
          is_completed: boolean | null
          metadata: Json | null
          reminder_sent: boolean | null
          reminder_type: string | null
          source: string
          source_id: string | null
          title: string
          trip_id: string | null
          trip_item_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          has_due_date?: boolean | null
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          reminder_sent?: boolean | null
          reminder_type?: string | null
          source: string
          source_id?: string | null
          title: string
          trip_id?: string | null
          trip_item_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          has_due_date?: boolean | null
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          reminder_sent?: boolean | null
          reminder_type?: string | null
          source?: string
          source_id?: string | null
          title?: string
          trip_id?: string | null
          trip_item_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_trip_item_id_fkey"
            columns: ["trip_item_id"]
            isOneToOne: false
            referencedRelation: "trip_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_conflicts: {
        Row: {
          client_version: Json | null
          conflict_type: string
          created_at: string | null
          event_id: string | null
          id: string
          resolution: string | null
          resolved_at: string | null
          server_version: Json | null
          user_id: string | null
        }
        Insert: {
          client_version?: Json | null
          conflict_type: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          server_version?: Json | null
          user_id?: string | null
        }
        Update: {
          client_version?: Json | null
          conflict_type?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          server_version?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_conflicts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_items: {
        Row: {
          created_at: string | null
          destination: string | null
          document_url: string | null
          end_date: string | null
          id: string
          raw_email_id: string | null
          start_date: string | null
          status: string | null
          trip_id: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          destination?: string | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          raw_email_id?: string | null
          start_date?: string | null
          status?: string | null
          trip_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          raw_email_id?: string | null
          start_date?: string | null
          status?: string | null
          trip_id?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_items_to_review: {
        Row: {
          created_at: string | null
          destination: string | null
          end_date: string | null
          file_name: string | null
          id: string
          mime_type: string | null
          original_name: string | null
          raw_email_id: string | null
          reason: string | null
          start_date: string | null
          status: string | null
          storage_path: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination?: string | null
          end_date?: string | null
          file_name?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          raw_email_id?: string | null
          reason?: string | null
          start_date?: string | null
          status?: string | null
          storage_path?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination?: string | null
          end_date?: string | null
          file_name?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          raw_email_id?: string | null
          reason?: string | null
          start_date?: string | null
          status?: string | null
          storage_path?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trip_updates_history: {
        Row: {
          action: string
          created_at: string
          id: string
          payload: Json
          source_email_id: string | null
          target_id: string | null
          target_table: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          payload: Json
          source_email_id?: string | null
          target_id?: string | null
          target_table: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          payload?: Json
          source_email_id?: string | null
          target_id?: string | null
          target_table?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          destination: string | null
          end_date: string | null
          id: string
          inferred_from: string | null
          source_email_id: string | null
          start_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          inferred_from?: string | null
          source_email_id?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          inferred_from?: string | null
          source_email_id?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          pushover_user_key: string | null
          user_secret: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          pushover_user_key?: string | null
          user_secret?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          pushover_user_key?: string | null
          user_secret?: string | null
        }
        Relationships: []
      }
      whatsapp_docs: {
        Row: {
          created_at: string | null
          file_name: string
          id: string
          message_id: string | null
          mime_type: string | null
          status: string | null
          storage_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          id?: string
          message_id?: string | null
          mime_type?: string | null
          status?: string | null
          storage_path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          id?: string
          message_id?: string | null
          mime_type?: string | null
          status?: string | null
          storage_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_docs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_groups: {
        Row: {
          created_at: string | null
          group_external_id: string
          group_name: string
          id: string
        }
        Insert: {
          created_at?: string | null
          group_external_id: string
          group_name: string
          id?: string
        }
        Update: {
          created_at?: string | null
          group_external_id?: string
          group_name?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _nullify_empty_text: { Args: { "": string }; Returns: string }
      _status_rank: { Args: { "": string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_trip: {
        Args: {
          p_confidence_score?: number
          p_destination: string
          p_end_date: string
          p_inferred_from?: string
          p_source_email_id: string
          p_start_date: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
