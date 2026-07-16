import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: string;
          verified: boolean;
          is_active: boolean;
          preferred_language: string;
          avatar_url: string | null;
          district: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: string;
          verified?: boolean;
          is_active?: boolean;
          preferred_language?: string;
          avatar_url?: string | null;
          district?: string | null;
          state?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: string;
          verified?: boolean;
          is_active?: boolean;
          preferred_language?: string;
          avatar_url?: string | null;
          district?: string | null;
          state?: string | null;
        };
      };
      athlete_profiles: {
        Row: {
          id: string;
          user_id: string;
          sport: string | null;
          position: string | null;
          district: string | null;
          state: string | null;
          level: string;
          achievements: unknown;
          video_urls: unknown;
          goals: string | null;
          bio: string | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          guardian_email: string | null;
          guardian_user_id: string | null;
          date_of_birth: string | null;
          profile_completion: number;
          visibility_settings: unknown;
          badges: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sport?: string | null;
          position?: string | null;
          district?: string | null;
          state?: string | null;
          level?: string;
          achievements?: unknown;
          video_urls?: unknown;
          goals?: string | null;
          bio?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          guardian_user_id?: string | null;
          date_of_birth?: string | null;
          profile_completion?: number;
          visibility_settings?: unknown;
          badges?: unknown;
        };
        Update: {
          id?: string;
          user_id?: string;
          sport?: string | null;
          position?: string | null;
          district?: string | null;
          state?: string | null;
          level?: string;
          achievements?: unknown;
          video_urls?: unknown;
          goals?: string | null;
          bio?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          guardian_user_id?: string | null;
          date_of_birth?: string | null;
          profile_completion?: number;
          visibility_settings?: unknown;
          badges?: unknown;
        };
      };
      mentor_profiles: {
        Row: {
          id: string;
          user_id: string;
          expertise: string[];
          experience_years: number;
          verified: boolean;
          certifications: unknown;
          languages: string[];
          trust_score: number;
          availability: string[];
          training_philosophy: string | null;
          code_of_conduct_accepted: boolean;
          response_time_hours: number;
          total_reviews: number;
          average_rating: number;
          district: string | null;
          state: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expertise?: string[];
          experience_years?: number;
          verified?: boolean;
          certifications?: unknown;
          languages?: string[];
          trust_score?: number;
          availability?: string[];
          training_philosophy?: string | null;
          code_of_conduct_accepted?: boolean;
          response_time_hours?: number;
          total_reviews?: number;
          average_rating?: number;
          district?: string | null;
          state?: string | null;
          bio?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          expertise?: string[];
          experience_years?: number;
          verified?: boolean;
          certifications?: unknown;
          languages?: string[];
          trust_score?: number;
          availability?: string[];
          training_philosophy?: string | null;
          code_of_conduct_accepted?: boolean;
          response_time_hours?: number;
          total_reviews?: number;
          average_rating?: number;
          district?: string | null;
          state?: string | null;
          bio?: string | null;
        };
      };
      scholarships: {
        Row: {
          id: string;
          name: string;
          provider: string;
          amount: number | null;
          eligibility: string | null;
          deadline: string | null;
          state: string | null;
          sport: string | null;
          girls_only: boolean;
          hostel_support: boolean;
          application_mode: string | null;
          description: string | null;
          application_url: string | null;
          required_level: string | null;
          min_age: number | null;
          max_age: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          amount?: number | null;
          eligibility?: string | null;
          deadline?: string | null;
          state?: string | null;
          sport?: string | null;
          girls_only?: boolean;
          hostel_support?: boolean;
          application_mode?: string | null;
          description?: string | null;
          application_url?: string | null;
          required_level?: string | null;
          min_age?: number | null;
          max_age?: number | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          provider?: string;
          amount?: number | null;
          eligibility?: string | null;
          deadline?: string | null;
          state?: string | null;
          sport?: string | null;
          girls_only?: boolean;
          hostel_support?: boolean;
          application_mode?: string | null;
          description?: string | null;
          application_url?: string | null;
          required_level?: string | null;
          min_age?: number | null;
          max_age?: number | null;
          is_active?: boolean;
        };
      };
      saved_scholarships: {
        Row: {
          id: string;
          user_id: string;
          scholarship_id: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scholarship_id: string;
          status?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          scholarship_id?: string;
          status?: string;
          notes?: string | null;
        };
      };
      mentorship_requests: {
        Row: {
          id: string;
          athlete_id: string;
          mentor_id: string;
          guardian_id: string | null;
          status: string;
          goal: string | null;
          mode: string;
          message: string | null;
          guardian_approved: boolean;
          guardian_approval_date: string | null;
          start_date: string | null;
          end_date: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          mentor_id: string;
          guardian_id?: string | null;
          status?: string;
          goal?: string | null;
          mode?: string;
          message?: string | null;
          guardian_approved?: boolean;
          guardian_approval_date?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          mentor_id?: string;
          guardian_id?: string | null;
          status?: string;
          goal?: string | null;
          mode?: string;
          message?: string | null;
          guardian_approved?: boolean;
          guardian_approval_date?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          rejection_reason?: string | null;
        };
      };
      safety_reports: {
        Row: {
          id: string;
          ticket_id: string;
          reporter_id: string;
          reported_user_id: string | null;
          category: string;
          severity: string;
          description: string;
          anonymous: boolean;
          evidence_urls: unknown;
          status: string;
          assigned_to: string | null;
          resolution_notes: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          category: string;
          severity?: string;
          description: string;
          anonymous?: boolean;
          evidence_urls?: unknown;
          status?: string;
          assigned_to?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          category?: string;
          severity?: string;
          description?: string;
          anonymous?: boolean;
          evidence_urls?: unknown;
          status?: string;
          assigned_to?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
        };
      };
      colleges: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          state: string | null;
          sports_quota: boolean;
          fee_concession: number;
          hostel: boolean;
          supported_sports: string[];
          quota_rules: string | null;
          required_achievement_level: string | null;
          academic_streams: string[];
          last_date: string | null;
          website_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          state?: string | null;
          sports_quota?: boolean;
          fee_concession?: number;
          hostel?: boolean;
          supported_sports?: string[];
          quota_rules?: string | null;
          required_achievement_level?: string | null;
          academic_streams?: string[];
          last_date?: string | null;
          website_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          state?: string | null;
          sports_quota?: boolean;
          fee_concession?: number;
          hostel?: boolean;
          supported_sports?: string[];
          quota_rules?: string | null;
          required_achievement_level?: string | null;
          academic_streams?: string[];
          last_date?: string | null;
          website_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          is_active?: boolean;
        };
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          type: string;
          organization: string | null;
          location: string | null;
          state: string | null;
          deadline: string | null;
          event_date: string | null;
          description: string | null;
          sport: string | null;
          women_focused: boolean;
          age_min: number | null;
          age_max: number | null;
          registration_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: string;
          organization?: string | null;
          location?: string | null;
          state?: string | null;
          deadline?: string | null;
          event_date?: string | null;
          description?: string | null;
          sport?: string | null;
          women_focused?: boolean;
          age_min?: number | null;
          age_max?: number | null;
          registration_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          type?: string;
          organization?: string | null;
          location?: string | null;
          state?: string | null;
          deadline?: string | null;
          event_date?: string | null;
          description?: string | null;
          sport?: string;
          women_focused?: boolean;
          age_min?: number | null;
          age_max?: number | null;
          registration_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          is_active?: boolean;
        };
      };
      training_resources: {
        Row: {
          id: string;
          title: string;
          category: string | null;
          content_type: string;
          content: string | null;
          video_url: string | null;
          author: string | null;
          created_by: string | null;
          duration_minutes: number | null;
          view_count: number;
          is_published: boolean;
          sport: string | null;
          thumbnail_url: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string | null;
          content_type?: string;
          content?: string | null;
          video_url?: string | null;
          author?: string | null;
          created_by?: string | null;
          duration_minutes?: number | null;
          view_count?: number;
          is_published?: boolean;
          sport?: string | null;
          thumbnail_url?: string | null;
          tags?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          category?: string | null;
          content_type?: string;
          content?: string | null;
          video_url?: string | null;
          author?: string | null;
          created_by?: string | null;
          duration_minutes?: number | null;
          view_count?: number;
          is_published?: boolean;
          sport?: string | null;
          thumbnail_url?: string | null;
          tags?: string[];
        };
      };
      mentor_reviews: {
        Row: {
          id: string;
          mentor_id: string;
          athlete_id: string;
          mentorship_request_id: string | null;
          respectful: number;
          helpful: number;
          knowledgeable: number;
          safe_communication: number;
          punctual: number;
          comment: string | null;
          private_safety_flag: boolean;
          moderated: boolean;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          athlete_id: string;
          mentorship_request_id?: string | null;
          respectful?: number;
          helpful?: number;
          knowledgeable?: number;
          safe_communication?: number;
          punctual?: number;
          comment?: string | null;
          private_safety_flag?: boolean;
          moderated?: boolean;
          visible?: boolean;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          athlete_id?: string;
          mentorship_request_id?: string | null;
          respectful?: number;
          helpful?: number;
          knowledgeable?: number;
          safe_communication?: number;
          punctual?: number;
          comment?: string | null;
          private_safety_flag?: boolean;
          moderated?: boolean;
          visible?: boolean;
        };
      };
      chat_threads: {
        Row: {
          id: string;
          athlete_id: string;
          mentor_id: string;
          mentorship_request_id: string | null;
          guardian_visible: boolean;
          is_active: boolean;
          is_blocked: boolean;
          blocked_by: string | null;
          blocked_reason: string | null;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          mentor_id: string;
          mentorship_request_id?: string | null;
          guardian_visible?: boolean;
          is_active?: boolean;
          is_blocked?: boolean;
          blocked_by?: string | null;
          blocked_reason?: string | null;
          last_message_at?: string;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          mentor_id?: string;
          mentorship_request_id?: string | null;
          guardian_visible?: boolean;
          is_active?: boolean;
          is_blocked?: boolean;
          blocked_by?: string | null;
          blocked_reason?: string | null;
          last_message_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          read_at: string | null;
          attachment_urls: unknown;
          moderation_flag: boolean;
          moderation_reason: string | null;
          guardian_visible: boolean;
          is_system_message: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          read_at?: string | null;
          attachment_urls?: unknown;
          moderation_flag?: boolean;
          moderation_reason?: string | null;
          guardian_visible?: boolean;
          is_system_message?: boolean;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
          read_at?: string | null;
          attachment_urls?: unknown;
          moderation_flag?: boolean;
          moderation_reason?: string | null;
          guardian_visible?: boolean;
          is_system_message?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          read_at: string | null;
          extra_data: unknown;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          read_at?: string | null;
          extra_data?: unknown;
          action_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          read_at?: string | null;
          extra_data?: unknown;
          action_url?: string | null;
        };
      };
      success_stories: {
        Row: {
          id: string;
          athlete_id: string;
          title: string;
          story: string;
          achievement: string | null;
          featured: boolean;
          approved: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          title: string;
          story: string;
          achievement?: string | null;
          featured?: boolean;
          approved?: boolean;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          title?: string;
          story?: string;
          achievement?: string | null;
          featured?: boolean;
          approved?: boolean;
          image_url?: string | null;
        };
      };
    };
  };
};
