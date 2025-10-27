import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  nome: string
  sobrenome: string
  cpf: string
  telefone: string
  nascimento: string
  api_token?: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    nome: string
    sobrenome: string
    cpf: string
    telefone: string
    nascimento: string
    api_token?: string
  }
}