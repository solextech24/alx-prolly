import { CreatePollFormEnhanced } from '@/components/forms/create-poll-form-enhanced'

export default function CreateEnhancedPollPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Poll</h1>
          <p className="text-muted-foreground mt-2">
            Share your question with the community and gather valuable insights
          </p>
        </div>
        
        <CreatePollFormEnhanced />
      </div>
    </div>
  )
}
