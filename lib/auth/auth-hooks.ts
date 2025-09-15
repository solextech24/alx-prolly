'use client'

import { useSession } from 'next-auth/react'

/**
 * Custom React hook for managing NextAuth authentication state.
 * 
 * This hook provides a convenient way to access the current user's authentication
 * state throughout the application. It wraps NextAuth's useSession hook with
 * additional convenience and type safety.
 * 
 * Key features:
 * - Automatic session management and state synchronization
 * - Loading state tracking for authentication operations
 * - Type-safe access to user data
 * - Integration with NextAuth session management
 * 
 * @returns Object containing current session data, loading state, and authentication status
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, isAuthenticated } = useAuth()
 *   
 *   if (isLoading) return <Spinner />
 *   if (!isAuthenticated) return <LoginPrompt />
 *   
 *   return <AuthenticatedContent user={user} />
 * }
 * ```
 */
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    /** Current user data from the session, null if not authenticated */
    user: session?.user ?? null,
    /** Current session object, null if not authenticated */
    session,
    /** True while authentication status is being determined */
    isLoading: status === 'loading',
    /** True if user is currently authenticated */
    isAuthenticated: !!session?.user,
    /** Current authentication status: 'loading' | 'authenticated' | 'unauthenticated' */
    status
  }
}