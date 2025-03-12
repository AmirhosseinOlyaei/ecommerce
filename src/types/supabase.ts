// Define basic types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// User and profile types
export interface UserMetadata {
  role?: 'user' | 'admin'
}

export interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: UserMetadata
  app_metadata?: Record<string, unknown>
  created_at?: string
}

// Profile type
export interface Profile {
  id: string
  updated_at?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  website?: string | null
}
