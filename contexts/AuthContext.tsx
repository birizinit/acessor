"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/shared/schema'

interface AuthContextType {
  user: SupabaseUser | null
  session: Session | null
  profile: User | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
  uploadAvatar: (file: File) => Promise<{ data: { path: string } | null; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (supabaseId: string) => {
    try {
      const response = await fetch(`/api/user?supabaseId=${supabaseId}`)
      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            cpf: userData.cpf,
            birth_date: userData.birthDate,
            country: userData.country,
            city: userData.city,
            gender: userData.gender,
          }
        }
      })

      if (error) {
        return { error }
      }

      // Criar perfil no banco de dados
      if (data.user) {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseId: data.user.id,
            email: data.user.email,
            ...userData,
          }),
        })

        if (!response.ok) {
          console.error('Erro ao criar perfil no banco de dados')
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { error: 'Usuário não autenticado' }
      }

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseId: user.id,
          ...updates,
        }),
      })

      if (!response.ok) {
        return { error: 'Erro ao atualizar perfil' }
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile.user)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        return { data: null, error }
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { data: { path: publicUrl }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}