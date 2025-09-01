'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  description?: string
  options: PollOption[]
  totalVotes: number
  createdAt: string
  isActive: boolean
  category: string
  author: {
    id: string
    name: string
    email: string
  }
}

export function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await fetch('/api/polls')
        if (!response.ok) {
          throw new Error('Failed to fetch polls')
        }
        const data = await response.json()
        setPolls(data.polls)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch polls')
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Card key={poll.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="line-clamp-2">{poll.question}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {poll.description}
                </CardDescription>
              </div>
              <Badge variant={poll.isActive ? 'default' : 'secondary'}>
                {poll.isActive ? 'Active' : 'Closed'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icons.users className="h-4 w-4" />
              <span>{poll.totalVotes} votes</span>
              <span>•</span>
              <span>{poll.category}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {poll.options.slice(0, 3).map((option, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  • {option.text}
                </div>
              ))}
              {poll.options.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{poll.options.length - 3} more options
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <a href={`/polls/${poll.id}`}>
                  <Icons.vote className="mr-2 h-4 w-4" />
                  Vote
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`/polls/${poll.id}`}>
                  <Icons.eye className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
