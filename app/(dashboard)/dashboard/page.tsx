import { Metadata } from 'next'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { PollsOverview } from '@/components/polls/polls-overview'
import { QuickActions } from '@/components/layout/quick-actions'
import ProtectedRoute from '@/components/auth/protected-route'

/**
 * Metadata configuration for the Dashboard page.
 * This enhances SEO and provides clear page identification in browser tabs.
 */
export const metadata: Metadata = {
  title: 'Dashboard | Polling App',
  description: 'Manage your polls and view analytics',
}

/**
 * Main Dashboard Page Component
 * 
 * This is the primary dashboard interface for authenticated users. It provides
 * a comprehensive overview of the user's polling activities, quick action buttons,
 * and poll management tools. The layout is responsive and adapts to different
 * screen sizes for optimal user experience.
 * 
 * Features:
 * - Authentication protection (redirects to login if not authenticated)
 * - Responsive grid layout with adaptive columns
 * - User-specific greeting and context
 * - Quick access to poll creation and management
 * - Overview of user's polls and statistics
 * - Consistent spacing and visual hierarchy
 * 
 * Layout Structure:
 * - Header: Welcome message and user actions
 * - Quick Actions: Buttons for common tasks (create poll, view analytics)
 * - Polls Overview: Grid displaying user's polls with statistics
 * 
 * Responsive Behavior:
 * - Mobile: Single column layout with stacked components
 * - Tablet: 2-column grid for better space utilization
 * - Desktop: Multi-column layout (up to 4 and 7 columns)
 * 
 * @returns JSX.Element - The complete dashboard interface
 * 
 * @example
 * ```tsx
 * // This page is accessed via the route: /dashboard
 * // It automatically protects access and provides user-specific content
 * ```
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Main dashboard header with user greeting and primary actions */}
        <DashboardHeader />
        
        {/* Quick action buttons in responsive grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActions />
        </div>
        
        {/* Main content area with polls overview */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <PollsOverview />
        </div>
      </div>
    </ProtectedRoute>
  )
}
