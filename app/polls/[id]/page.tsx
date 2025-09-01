'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  description?: string
  options: PollOption[]
  totalVotes: number
  createdAt: string
  updatedAt: string
  expiresAt?: string
  isActive: boolean
  category: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export default function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [userVote, setUserVote] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPoll() {
      try {
        const response = await fetch(`/api/polls/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error('Failed to fetch poll')
        }
        const data = await response.json()
        setPoll(data.poll)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch poll')
      } finally {
        setLoading(false)
      }
    }

    fetchPoll()
  }, [resolvedParams.id])

  const handleVote = async () => {
    if (!selectedOption || !poll) return

    setVoting(true)
    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId: selectedOption,
          userId: 'user-1' // Using demo user from our sample data
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      // Refresh poll data after voting
      const updatedResponse = await fetch(`/api/polls/${resolvedParams.id}`)
      const updatedData = await updatedResponse.json()
      setPoll(updatedData.poll)
      setSelectedOption(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!poll) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{poll.question}</h1>
          {poll.description && (
            <p className="text-muted-foreground mt-2">{poll.description}</p>
          )}
        </div>
        <Badge variant={poll.isActive ? 'default' : 'secondary'}>
          {poll.isActive ? 'Active' : 'Closed'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {poll.options.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => poll.isActive && setSelectedOption(option.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.votes} votes ({option.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              
              {poll.isActive && (
                <Button 
                  onClick={handleVote} 
                  disabled={!selectedOption || voting}
                  className="w-full"
                >
                  {voting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {voting ? 'Voting...' : 'Submit Vote'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Poll Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Icons.users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {poll.totalVotes} total votes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created {new Date(poll.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.user className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">By {poll.author.name}</span>
              </div>
              <div className="pt-2 border-t">
                <Badge variant="outline">{poll.category}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
