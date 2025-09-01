import { Metadata } from 'next'
import { PollsList } from '@/components/polls/polls-list'
import { PollsFilter } from '@/components/polls/polls-filter'

export const metadata: Metadata = {
  title: 'Polls | Polling App',
  description: 'Browse and vote on polls created by the community',
}

export default function PollsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
        <p className="text-muted-foreground">
          Discover and participate in polls from the community
        </p>
      </div>
      
      <PollsFilter />
      <PollsList />
    </div>
  )
}
