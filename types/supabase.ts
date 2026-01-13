// Simplified Supabase types for the migration
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
      users: {
        Row: {
          id: string
          email: string
          password: string
          first_name: string
          last_name: string
          role: 'SuperAdmin' | 'Admin' | 'Moderator' | 'User'
          is_active: boolean
          two_factor_secret: string | null
          two_factor_enabled: boolean
          password_reset_token: string | null
          password_reset_expires: string | null
          last_login: string | null
          login_attempts: number
          lock_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          first_name: string
          last_name: string
          role?: 'SuperAdmin' | 'Admin' | 'Moderator' | 'User'
          is_active?: boolean
          two_factor_secret?: string | null
          two_factor_enabled?: boolean
          password_reset_token?: string | null
          password_reset_expires?: string | null
          last_login?: string | null
          login_attempts?: number
          lock_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          first_name?: string
          last_name?: string
          role?: 'SuperAdmin' | 'Admin' | 'Moderator' | 'User'
          is_active?: boolean
          two_factor_secret?: string | null
          two_factor_enabled?: boolean
          password_reset_token?: string | null
          password_reset_expires?: string | null
          last_login?: string | null
          login_attempts?: number
          lock_until?: string | null
          updated_at?: string
        }
      }
      gems: {
        Row: {
          id: string
          name: string
          price: number
          category: string | null
          description: string | null
          identification: string | null
          weight_carats: string | null
          color: string | null
          clarity: string | null
          shape_and_cut: string | null
          dimensions: string | null
          treatments: string | null
          origin: string | null
          carat_weight: number | null
          cut: string | null
          certification: string | null
          images: string[] | null
          is_active: boolean
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          category?: string | null
          description?: string | null
          identification?: string | null
          weight_carats?: string | null
          color?: string | null
          clarity?: string | null
          shape_and_cut?: string | null
          dimensions?: string | null
          treatments?: string | null
          origin?: string | null
          carat_weight?: number | null
          cut?: string | null
          certification?: string | null
          images?: string[] | null
          is_active?: boolean
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category?: string | null
          description?: string | null
          identification?: string | null
          weight_carats?: string | null
          color?: string | null
          clarity?: string | null
          shape_and_cut?: string | null
          dimensions?: string | null
          treatments?: string | null
          origin?: string | null
          carat_weight?: number | null
          cut?: string | null
          certification?: string | null
          images?: string[] | null
          is_active?: boolean
          stock_quantity?: number
          updated_at?: string
        }
      }
      jwellery: {
        Row: {
          id: string
          name: string
          price: number
          metal_type_purity: string | null
          gross_weight_grams: number | null
          gemstone_type: string | null
          carat_weight: number | null
          cut_and_shape: string | null
          color_and_clarity: string | null
          report_number: string | null
          report_date: string | null
          authorized_seal_signature: string | null
          images: string[] | null
          is_active: boolean
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          metal_type_purity?: string | null
          gross_weight_grams?: number | null
          gemstone_type?: string | null
          carat_weight?: number | null
          cut_and_shape?: string | null
          color_and_clarity?: string | null
          report_number?: string | null
          report_date?: string | null
          authorized_seal_signature?: string | null
          images?: string[] | null
          is_active?: boolean
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          metal_type_purity?: string | null
          gross_weight_grams?: number | null
          gemstone_type?: string | null
          carat_weight?: number | null
          cut_and_shape?: string | null
          color_and_clarity?: string | null
          report_number?: string | null
          report_date?: string | null
          authorized_seal_signature?: string | null
          images?: string[] | null
          is_active?: boolean
          stock_quantity?: number
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_amount: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          billing_details: Json
          payment_status: 'pending' | 'completed' | 'failed'
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_amount: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          billing_details: Json
          payment_status?: 'pending' | 'completed' | 'failed'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          total_amount?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          billing_details?: Json
          payment_status?: 'pending' | 'completed' | 'failed'
          payment_id?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          product_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          product_details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          product_details?: Json
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string
          changes: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          changes?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          changes?: Record<string, any>
        }
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
  }
}