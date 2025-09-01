import { Metadata } from 'next'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { PollsOverview } from '@/components/polls/polls-overview'
import { QuickActions } from '@/components/layout/quick-actions'

export const metadata: Metadata = {
  title: 'Dashboard | Polling App',
  description: 'Manage your polls and view analytics',
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActions />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <PollsOverview />
      </div>
    </div>
  )
}
