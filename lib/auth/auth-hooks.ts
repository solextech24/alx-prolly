'use client'

import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { useSupabase } from '@/components/providers/auth-provider'

export function useAuth() {
  const { supabase } = useSupabase()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      }
      setSession(data.session)
      setIsLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  return { session, isLoading }
}