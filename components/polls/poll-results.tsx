'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

interface PollResultsProps {
  pollId: string
}

// Mock data - replace with actual data fetching
const mockResults = {
  totalVotes: 156,
  participationRate: 78.5,
  averageTimeToVote: '2.3 minutes',
  topOption: 'JavaScript',
  topOptionVotes: 45,
  topOptionPercentage: 28.8,
  recentVotes: [
    { user: 'Alice', option: 'Python', time: '2 minutes ago' },
    { user: 'Bob', option: 'TypeScript', time: '5 minutes ago' },
    { user: 'Charlie', option: 'JavaScript', time: '8 minutes ago' },
    { user: 'Diana', option: 'Rust', time: '12 minutes ago' },
    { user: 'Eve', option: 'Go', time: '15 minutes ago' }
  ]
}

export function PollResults({ pollId }: PollResultsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.barChart className="h-5 w-5" />
            Results Summary
          </CardTitle>
          <CardDescription>
            Overview of poll performance and engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{mockResults.totalVotes}</div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{mockResults.participationRate}%</div>
              <div className="text-sm text-muted-foreground">Participation</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Top Choice:</span>
              <Badge variant="secondary">{mockResults.topOption}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Votes for top choice:</span>
              <span className="font-medium">{mockResults.topOptionVotes} ({mockResults.topOptionPercentage}%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average time to vote:</span>
              <span className="font-medium">{mockResults.averageTimeToVote}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest votes and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockResults.recentVotes.map((vote, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">{vote.user}</span>
                  <span className="text-muted-foreground">voted for</span>
                  <Badge variant="outline">{vote.option}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{vote.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
