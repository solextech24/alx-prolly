'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import type { BranchPoll } from '@/lib/types'

interface PollViewProps {
  pollId: string
}

export function PollView({ pollId }: PollViewProps) {
  const [poll, setPoll] = useState<BranchPoll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchPoll() {
      try {
        setLoading(true)
        const res = await fetch(`/api/polls/${pollId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch poll')
        }
        const data = await res.json()
        if (isMounted) setPoll(data.poll)
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Failed to fetch poll')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchPoll()
    return () => { isMounted = false }
  }, [pollId])

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
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        ) : poll ? (
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{poll.question}</CardTitle>
              {poll.description && (
                <CardDescription className="text-base">
                  {poll.description}
                </CardDescription>
              )}
            </div>
            <Badge variant={poll.isActive ? 'default' : 'secondary'}>
              {poll.isActive ? 'Active' : 'Closed'}
            </Badge>
          </div>
        ) : null}
        
        {poll && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icons.user className="h-4 w-4" />
              <span>By {poll.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.calendar className="h-4 w-4" />
              <span>Created {formatDate(poll.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icons.users className="h-4 w-4" />
              <span>{poll.totalVotes} total votes</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasVoted ? (
          <>
            <div className="space-y-3">
              {poll?.options.map((option) => (
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
              disabled={!selectedOption || !poll}
              className="w-full"
            >
              <Icons.vote className="mr-2 h-4 w-4" />
              Submit Vote
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            {poll?.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{option.text}</span>
                  <span className="font-medium">{option.votes} votes</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${poll.totalVotes > 0 ? Math.min((option.votes / poll.totalVotes) * 100, 100) : 0}%` }}
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
