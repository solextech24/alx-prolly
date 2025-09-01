'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

export default function VotingDemoPage() {
  const votingFeatures = [
    {
      icon: Icons.vote,
      title: 'Radio Button Selection',
      description: 'Users can select options using proper radio buttons for clear choice selection'
    },
    {
      icon: Icons.checkCircle,
      title: 'Visual Feedback',
      description: 'Selected options are highlighted with visual indicators and confirmation'
    },
    {
      icon: Icons.activity,
      title: 'Real-time Results', 
      description: 'Vote counts and percentages update immediately after submission'
    },
    {
      icon: Icons.users,
      title: 'Thank You Message',
      description: 'Users receive confirmation and appreciation for their participation'
    }
  ]

  const demoPolls = [
    {
      id: 'poll-1',
      title: 'Programming Languages',
      description: 'Vote for your favorite programming language',
      category: 'Technology',
      options: 5,
      totalVotes: 156
    },
    {
      id: 'poll-2', 
      title: 'Team Meeting Times',
      description: 'Help decide the best meeting schedule',
      category: 'Work',
      options: 3,
      totalVotes: 89
    },
    {
      id: 'poll-3',
      title: 'Project Management Tools', 
      description: 'Choose our team collaboration tool',
      category: 'Productivity',
      options: 4,
      totalVotes: 67
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Voting System Demo</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience our enhanced voting interface with radio buttons, real-time results, 
          and thank you messages. Test the complete voting flow!
        </p>
      </div>

      {/* Voting Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.checkCircle className="h-5 w-5 text-green-600" />
            Enhanced Voting Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {votingFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Polls */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Try Voting on These Polls</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoPolls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{poll.title}</CardTitle>
                  <Badge variant="outline">{poll.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{poll.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{poll.options} options</span>
                    <span className="font-medium">{poll.totalVotes} votes</span>
                  </div>
                  
                  <Link href={`/polls/${poll.id}`}>
                    <Button className="w-full">
                      <Icons.vote className="mr-2 h-4 w-4" />
                      Vote Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Voting Flow Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Voting Flow Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h4 className="font-medium">Select Option</h4>
              <p className="text-sm text-muted-foreground">Choose your preferred option using radio buttons</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-semibold">2</span>
              </div>
              <h4 className="font-medium">Submit Vote</h4>
              <p className="text-sm text-muted-foreground">Click the submit button to cast your vote</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-semibold">3</span>
              </div>
              <h4 className="font-medium">Thank You</h4>
              <p className="text-sm text-muted-foreground">See confirmation message and updated results</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-orange-600 font-semibold">4</span>
              </div>
              <h4 className="font-medium">View Results</h4>
              <p className="text-sm text-muted-foreground">See real-time vote counts and percentages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>What&apos;s New in Voting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Implemented Features:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-green-600" />
                  Radio button selection form
                </li>
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-green-600" />
                  Visual feedback for selected options
                </li>
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-green-600" />
                  Thank you message after voting
                </li>
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-green-600" />
                  Real-time results update
                </li>
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-green-600" />
                  Loading states and error handling
                </li>
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-green-600" />
                  Vote confirmation indicators
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">🎯 User Experience:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Icons.vote className="h-4 w-4 text-blue-600" />
                  Intuitive radio button interface
                </li>
                <li className="flex items-center gap-2">
                  <Icons.eye className="h-4 w-4 text-blue-600" />
                  Clear visual selection feedback
                </li>
                <li className="flex items-center gap-2">
                  <Icons.activity className="h-4 w-4 text-blue-600" />
                  Immediate results visualization
                </li>
                <li className="flex items-center gap-2">
                  <Icons.users className="h-4 w-4 text-blue-600" />
                  Appreciation for participation
                </li>
                <li className="flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4 text-blue-600" />
                  Vote update capability
                </li>
                <li className="flex items-center gap-2">
                  <Icons.barChart className="h-4 w-4 text-blue-600" />
                  Progressive result bars
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="text-center pt-4">
        <div className="inline-flex gap-4">
          <Link href="/polls">
            <Button variant="outline">
              <Icons.list className="mr-2 h-4 w-4" />
              All Polls
            </Button>
          </Link>
          <Link href="/polls/create">
            <Button variant="outline">
              <Icons.plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
