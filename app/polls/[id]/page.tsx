import { Metadata } from 'next'
import { PollView } from '@/components/polls/poll-view'
import { PollResults } from '@/components/polls/poll-results'

export const metadata: Metadata = {
  title: 'Poll | Polling App',
  description: 'View and vote on this poll',
}

interface PollPageProps {
  params: {
    id: string
  }
}

export default function PollPage({ params }: PollPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PollView pollId={params.id} />
      <PollResults pollId={params.id} />
    </div>
  )
}
