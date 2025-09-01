import { Metadata } from 'next'
import { CreatePollForm } from '@/components/forms/create-poll-form'

export const metadata: Metadata = {
  title: 'Create Poll | Polling App',
  description: 'Create a new poll to gather opinions from the community',
}

export default function CreatePollPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Poll</h1>
        <p className="text-muted-foreground">
          Design your poll and share it with the community
        </p>
      </div>
      
      <div className="max-w-2xl">
        <CreatePollForm />
      </div>
    </div>
  )
}
