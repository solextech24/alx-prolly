'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

// Mock data - replace with actual data fetching
const stats = [
  {
    title: 'Total Polls',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: Icons.barChart
  },
  {
    title: 'Active Polls',
    value: '8',
    change: '+3',
    changeType: 'positive',
    icon: Icons.activity
  },
  {
    title: 'Total Votes',
    value: '1,234',
    change: '+23%',
    changeType: 'positive',
    icon: Icons.users
  },
  {
    title: 'Avg. Engagement',
    value: '78%',
    change: '+5%',
    changeType: 'positive',
    icon: Icons.trendingUp
  }
]

const recentPolls = [
  {
    id: '1',
    question: 'What is your favorite programming language?',
    votes: 156,
    status: 'active',
    createdAt: '2 hours ago'
  },
  {
    id: '2',
    question: 'Which framework should we use?',
    votes: 89,
    status: 'active',
    createdAt: '1 day ago'
  },
  {
    id: '3',
    question: 'Team lunch decision',
    votes: 23,
    status: 'closed',
    createdAt: '3 days ago'
  }
]

export function PollsOverview() {
  return (
    <>
      {/* Stats Cards */}
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Recent Polls */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Polls</CardTitle>
          <CardDescription>
            Your latest polls and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPolls.map((poll) => (
              <div key={poll.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-1">{poll.question}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Icons.users className="h-4 w-4" />
                    <span>{poll.votes} votes</span>
                    <span>•</span>
                    <span>{poll.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                    {poll.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Icons.eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Polls
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
