'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

const quickActions = [
  {
    title: 'Create Poll',
    description: 'Start a new poll to gather opinions',
    icon: Icons.plus,
    action: '/polls/create',
    color: 'bg-blue-500'
  },
  {
    title: 'View Results',
    description: 'Check the latest poll results',
    icon: Icons.barChart,
    action: '/polls',
    color: 'bg-green-500'
  },
  {
    title: 'My Polls',
    description: 'Manage your created polls',
    icon: Icons.list,
    action: '/dashboard',
    color: 'bg-purple-500'
  },
  {
    title: 'Analytics',
    description: 'View detailed poll analytics',
    icon: Icons.trendingUp,
    action: '/analytics',
    color: 'bg-orange-500'
  }
]

export function QuickActions() {
  return (
    <>
      {quickActions.map((action, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">
              {action.description}
            </p>
            <Button variant="outline" size="sm" className="w-full">
              {action.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
