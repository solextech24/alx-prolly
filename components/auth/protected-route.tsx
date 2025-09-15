'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { User } from '@/lib/types'

/**
 * Protected Route Component for Client-Side Route Protection
 * 
 * This component provides client-side route protection by checking for user authentication
 * before rendering protected content. It implements a demo-mode authentication system
 * using localStorage for development and testing purposes.
 * 
 * Key features:
 * - Client-side authentication guard
 * - Loading state with spinner for better UX
 * - Automatic redirect to login for unauthenticated users
 * - Demo user support for development/testing
 * 
 * Security Note: This is client-side protection only and should be supplemented
 * with server-side authentication checks for sensitive operations.
 * 
 * @param children - React components to render when user is authenticated
 * 
 * @example
 * ```tsx
 * // Protect the entire dashboard
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <ProtectedRoute>
 *       <DashboardHeader />
 *       {children}
 *     </ProtectedRoute>
 *   )
 * }
 * ```
 * 
 * @todo Replace localStorage demo user with actual authentication integration
 * @todo Add server-side session validation
 * @todo Implement proper session management
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    /**
     * Check for demo user authentication in localStorage.
     * This is a temporary implementation for development purposes.
     * In production, this should validate actual user sessions.
     */
    // Check for demo user in localStorage - temporary implementation
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser))
      } catch (error) {
        // Handle corrupted localStorage data
        console.error('Invalid demo user data in localStorage:', error)
        localStorage.removeItem('demo-user')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    /**
     * Redirect unauthenticated users to login page.
     * This effect runs after the loading state is resolved to avoid
     * premature redirects during the authentication check.
     */
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Show loading spinner while checking authentication status
  // This provides better UX and prevents flash of unauthenticated content
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icons.spinner className="w-12 h-12 animate-spin" />
      </div>
    )
  }

  // Return null while redirecting to prevent rendering protected content
  // to unauthenticated users during the redirect process
  if (!user) {
    return null
  }

  // Render protected content for authenticated users
  return <>{children}</>
}