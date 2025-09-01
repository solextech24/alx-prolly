'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser) {
      setUser(JSON.parse(demoUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icons.spinner className="w-12 h-12 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}