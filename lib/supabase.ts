import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          api_token: string | null
          phone: string | null
          cpf: string | null
          birth_date: string | null
          country: string | null
          city: string | null
          gender: string | null
          language: string | null
          preferences: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          api_token?: string | null
          phone?: string | null
          cpf?: string | null
          birth_date?: string | null
          country?: string | null
          city?: string | null
          gender?: string | null
          language?: string | null
          preferences?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          api_token?: string | null
          phone?: string | null
          cpf?: string | null
          birth_date?: string | null
          country?: string | null
          city?: string | null
          gender?: string | null
          language?: string | null
          preferences?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}