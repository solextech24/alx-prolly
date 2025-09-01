'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PollDemoPage() {
  const demoPolls = [
    {
      id: 'poll-1',
      title: 'Programming Languages Poll',
      description: 'Vote for your favorite programming language',
      category: 'Technology'
    },
    {
      id: 'poll-2', 
      title: 'Team Meeting Times',
      description: 'Help decide the best meeting schedule',
      category: 'Work'
    },
    {
      id: 'poll-3',
      title: 'Project Management Tools', 
      description: 'Choose our team collaboration tool',
      category: 'Productivity'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Poll Demo</h1>
        <p className="text-muted-foreground mt-2">
          Test the poll detail pages with mock data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoPolls.map((poll) => (
          <Card key={poll.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{poll.title}</CardTitle>
                <Badge variant="outline">{poll.category}</Badge>
              </div>
              <p className="text-muted-foreground">{poll.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/polls/${poll.id}`}>
                  <Button className="w-full">
                    View Poll Details
                  </Button>
                </Link>
                <div className="text-center">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    /polls/{poll.id}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-6">
        <div className="inline-flex gap-4">
          <Link href="/polls">
            <Button variant="outline">
              View All Polls
            </Button>
          </Link>
          <Link href="/polls/create">
            <Button variant="outline">
              Create New Poll
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Features Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">✅ Working Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Poll detail page with question & options</li>
                <li>• Vote percentages and counts</li>
                <li>• Responsive design</li>
                <li>• Loading states</li>
                <li>• Error handling</li>
                <li>• Mock data fallback</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔧 Next Steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure Supabase credentials</li>
                <li>• Connect real database</li>
                <li>• Add user authentication</li>
                <li>• Enable real voting</li>
                <li>• Add poll creation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
