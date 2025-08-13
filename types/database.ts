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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          member_since: string
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          member_since?: string
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          member_since?: string
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sermons: {
        Row: {
          id: string
          title: string
          speaker: string
          date: string
          duration: string
          series: string
          audio_url: string | null
          video_url: string | null
          image_url: string
          description: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          speaker: string
          date: string
          duration: string
          series: string
          audio_url?: string | null
          video_url?: string | null
          image_url: string
          description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          speaker?: string
          date?: string
          duration?: string
          series?: string
          audio_url?: string | null
          video_url?: string | null
          image_url?: string
          description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          location: string
          description: string
          category: string
          attendees: number
          capacity: number | null
          image_url: string | null
          is_rsvp_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          location: string
          description: string
          category: string
          attendees?: number
          capacity?: number | null
          image_url?: string | null
          is_rsvp_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          location?: string
          description?: string
          category?: string
          attendees?: number
          capacity?: number | null
          image_url?: string | null
          is_rsvp_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      prayer_requests: {
        Row: {
          id: string
          title: string
          description: string
          submitted_by: string | null
          submitted_at: string
          is_anonymous: boolean
          prayer_count: number
          category: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          submitted_by?: string | null
          submitted_at?: string
          is_anonymous?: boolean
          prayer_count?: number
          category: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          submitted_by?: string | null
          submitted_at?: string
          is_anonymous?: boolean
          prayer_count?: number
          category?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      giving_categories: {
        Row: {
          id: string
          title: string
          description: string
          goal: number
          raised: number
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          goal: number
          raised?: number
          color: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          goal?: number
          raised?: number
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          is_recurring: boolean
          frequency: string | null
          payment_method: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          is_recurring?: boolean
          frequency?: string | null
          payment_method: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          is_recurring?: boolean
          frequency?: string | null
          payment_method?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone_number: string | null
          additional_info: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone_number?: string | null
          additional_info?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone_number?: string | null
          additional_info?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_verses: {
        Row: {
          id: string
          verse: string
          reference: string
          date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          verse: string
          reference: string
          date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          verse?: string
          reference?: string
          date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bible_reading_plans: {
        Row: {
          id: string
          name: string
          description: string
          duration_days: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration_days: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration_days?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bible_reading_plan_days: {
        Row: {
          id: string
          plan_id: string
          day_number: number
          reading_reference: string
          reading_text: string | null
          reflection_question: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          day_number: number
          reading_reference: string
          reading_text?: string | null
          reflection_question?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          day_number?: number
          reading_reference?: string
          reading_text?: string | null
          reflection_question?: string | null
          created_at?: string
        }
      }
      user_reading_progress: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          day_number: number
          completed_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          day_number: number
          completed_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          day_number?: number
          completed_at?: string
          notes?: string | null
          created_at?: string
        }
      }
      word_of_day_slides: {
        Row: {
          id: string
          type: 'image' | 'video' | 'verse'
          content_url: string
          word: string
          verse: string
          reference: string
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'image' | 'video' | 'verse'
          content_url?: string
          word: string
          verse: string
          reference: string
          order_index: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'image' | 'video' | 'verse'
          content_url?: string
          word?: string
          verse?: string
          reference?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
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