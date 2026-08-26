export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          location_name: string | null
          location_address: string | null
          location_url: string | null
          cover_image_url: string | null
          drive_folder_id: string | null
          drive_url: string | null
          is_completed: boolean | null
          trip_date: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          location_name?: string | null
          location_address?: string | null
          location_url?: string | null
          cover_image_url?: string | null
          drive_folder_id?: string | null
          drive_url?: string | null
          is_completed?: boolean | null
          trip_date?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string | null
          location_name?: string | null
          location_address?: string | null
          location_url?: string | null
          cover_image_url?: string | null
          drive_folder_id?: string | null
          drive_url?: string | null
          is_completed?: boolean | null
          trip_date?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      plan_photos: {
        Row: {
          id: string
          plan_id: string
          storage_path: string
          public_url: string
          created_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          storage_path: string
          public_url: string
          created_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          storage_path?: string
          public_url?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_photos_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          }
        ]
      }
      plan_reviews: {
        Row: {
          id: string
          plan_id: string
          author_name: string
          reflection: string
          rating: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          author_name: string
          reflection: string
          rating?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          author_name?: string
          reflection?: string
          rating?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_reviews_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
