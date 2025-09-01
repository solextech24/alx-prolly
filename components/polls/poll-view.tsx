'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

interface PollViewProps {
  pollId: string
}

// Mock data - replace with actual data fetching
const mockPoll = {
  id: '1',
  question: 'What is your favorite programming language?',
  description: 'Choose the language you enjoy working with the most. This poll will help us understand the team\'s preferences for future projects.',
  options: [
    { id: '1', text: 'JavaScript', votes: 45, percentage: 28.8 },
    { id: '2', text: 'Python', votes: 38, percentage: 24.4 },
    { id: '3', text: 'TypeScript', votes: 32, percentage: 20.5 },
    { id: '4', text: 'Rust', votes: 25, percentage: 16.0 },
    { id: '5', text: 'Go', votes: 16, percentage: 10.3 }
  ],
  totalVotes: 156,
  createdAt: '2024-01-15',
  isActive: true,
  category: 'Technology',
  author: 'John Doe',
  expiresAt: '2024-02-15'
}

export function PollView({ pollId }: PollViewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true)
      // TODO: Implement actual voting logic
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{mockPoll.question}</CardTitle>
            <CardDescription className="text-base">
              {mockPoll.description}
            </CardDescription>
          </div>
          <Badge variant={mockPoll.isActive ? 'default' : 'secondary'}>
            {mockPoll.isActive ? 'Active' : 'Closed'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icons.user className="h-4 w-4" />
            <span>By {mockPoll.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.calendar className="h-4 w-4" />
            <span>Created {formatDate(mockPoll.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.users className="h-4 w-4" />
            <span>{mockPoll.totalVotes} total votes</span>
          </div>
          {mockPoll.expiresAt && (
            <div className="flex items-center gap-1">
              <Icons.clock className="h-4 w-4" />
              <span>Expires {formatDate(mockPoll.expiresAt)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasVoted ? (
          <>
            <div className="space-y-3">
              {mockPoll.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="mr-3"
                    aria-label={`Vote for ${option.text}`}
                  />
                  <span className="flex-1">{option.text}</span>
                </label>
              ))}
            </div>
            
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption}
              className="w-full"
            >
              <Icons.vote className="mr-2 h-4 w-4" />
              Submit Vote
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            {mockPoll.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{option.text}</span>
                  <span className="font-medium">{option.votes} votes ({option.percentage}%)</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Thank you for voting! You can see the results above.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
