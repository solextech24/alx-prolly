'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

// Mock data - replace with actual data fetching
const mockPolls = [
  {
    id: '1',
    question: 'What is your favorite programming language?',
    description: 'Choose the language you enjoy working with the most',
    options: ['JavaScript', 'Python', 'TypeScript', 'Rust', 'Go'],
    totalVotes: 156,
    createdAt: '2024-01-15',
    isActive: true,
    category: 'Technology'
  },
  {
    id: '2',
    question: 'Which framework should we use for the next project?',
    description: 'Help us decide on the best framework for our team',
    options: ['React', 'Vue', 'Angular', 'Svelte'],
    totalVotes: 89,
    createdAt: '2024-01-14',
    isActive: true,
    category: 'Development'
  },
  {
    id: '3',
    question: 'What should we have for lunch today?',
    description: 'Team lunch decision for Friday',
    options: ['Pizza', 'Sushi', 'Burger', 'Salad'],
    totalVotes: 23,
    createdAt: '2024-01-13',
    isActive: false,
    category: 'Team'
  }
]

export function PollsList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockPolls.map((poll) => (
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
                  • {option}
                </div>
              ))}
              {poll.options.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{poll.options.length - 3} more options
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1">
                <Icons.vote className="mr-2 h-4 w-4" />
                Vote
              </Button>
              <Button size="sm" variant="outline">
                <Icons.eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
