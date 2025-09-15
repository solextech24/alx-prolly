'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

/**
 * User interface representing the current authenticated user.
 * This interface defines the structure of user data displayed in the dashboard header.
 */
interface User {
  /** Unique user identifier */
  id: string
  /** User's email address */
  email: string
  /** User's display name */
  name: string
  /** Optional user avatar/profile image URL */
  avatar?: string | null
}

/**
 * Dashboard Header Component
 * 
 * This component renders the main header for the dashboard interface, providing
 * user context, navigation options, and quick actions. It manages user session
 * state and provides logout functionality.
 * 
 * Key Features:
 * - Personalized greeting with user's name
 * - User avatar and profile dropdown menu
 * - Quick access to poll creation
 * - Logout functionality with state cleanup
 * - Loading states for better UX
 * - Responsive design with proper spacing
 * 
 * User Experience:
 * - Shows loading skeleton while fetching user data
 * - Gracefully handles missing user information
 * - Provides clear visual feedback for all interactions
 * - Maintains consistent styling with the design system
 * 
 * Demo Mode:
 * Currently uses localStorage for demo user management.
 * In production, this should integrate with actual authentication.
 * 
 * @returns JSX.Element - The dashboard header with user context and actions
 * 
 * @example
 * ```tsx
 * // Usage in dashboard layout
 * <DashboardHeader />
 * ```
 */
export function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    /**
     * Load user data from localStorage (demo implementation).
     * In production, this should fetch from secure session storage
     * or make an API call to get current user data.
     */
    // Get demo user from localStorage
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser))
      } catch (error) {
        // Handle corrupted localStorage data
        console.error('Invalid demo user data:', error)
        localStorage.removeItem('demo-user')
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * Handles user logout by clearing session data and redirecting.
   * This function ensures complete cleanup of user state and
   * redirects to the public polls page.
   */
  const handleLogout = () => {
    localStorage.removeItem('demo-user')
    setUser(null)
    router.push('/polls')  // Redirect to public polls page
  }

  // Show loading skeleton while user data is being fetched
  // This prevents layout shift and provides visual feedback
  if (isLoading) {
    return (
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between space-y-2">
      {/* Welcome section with personalized greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name || 'User'}!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your polls today.
        </p>
      </div>
      
      {/* Action buttons and user menu */}
      <div className="flex items-center space-x-2">
        {/* Quick action button for poll creation */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/polls/create">
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Poll
          </Link>
        </Button>
        
        {/* User avatar and dropdown menu (only shown when user is loaded) */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {/* User information display */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Navigation menu items */}
              <DropdownMenuItem>
                <Icons.user className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icons.settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Logout action */}
              <DropdownMenuItem onClick={handleLogout}>
                <Icons.logOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
