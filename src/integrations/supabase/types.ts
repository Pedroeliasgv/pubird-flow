export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };

      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          billing_email: string | null;
          phone: string | null;
          timezone: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          billing_email?: string | null;
          phone?: string | null;
          timezone?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          billing_email?: string | null;
          phone?: string | null;
          timezone?: string;
          status?: string;
          updated_at?: string;
        };
      };

      company_members: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: string;
          status?: string;
          updated_at?: string;
        };
      };

      leads: {
        Row: {
          id: string;
          company_id: string;
          created_by: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          source: string | null;
          status: string;
          notes: string | null;
          tags: string[];
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          created_by?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          status?: string;
          notes?: string | null;
          tags?: string[];
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          status?: string;
          notes?: string | null;
          tags?: string[];
          data?: Json;
          updated_at?: string;
        };
      };
    };
  };
};