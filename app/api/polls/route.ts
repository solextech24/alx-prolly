import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // For now, return mock data since we need to set up Supabase tables
    const mockPolls = [
      {
        id: '1',
        question: 'What is your favorite programming language?',
        description: 'Choose the language you enjoy working with the most',
        options: [
          { id: '1', text: 'JavaScript', votes: 45 },
          { id: '2', text: 'Python', votes: 38 },
          { id: '3', text: 'TypeScript', votes: 42 },
          { id: '4', text: 'Rust', votes: 18 },
          { id: '5', text: 'Go', votes: 13 }
        ],
        totalVotes: 156,
        createdAt: '2024-01-15',
        isActive: true,
        category: 'Technology',
        author: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      {
        id: '2',
        question: 'Which framework should we use for the next project?',
        description: 'Help us decide on the best framework for our team',
        options: [
          { id: '1', text: 'React', votes: 34 },
          { id: '2', text: 'Vue', votes: 22 },
          { id: '3', text: 'Angular', votes: 18 },
          { id: '4', text: 'Svelte', votes: 15 }
        ],
        totalVotes: 89,
        createdAt: '2024-01-14',
        isActive: true,
        category: 'Development',
        author: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      },
      {
        id: '3',
        question: 'What should we have for lunch today?',
        description: 'Team lunch decision for Friday',
        options: [
          { id: '1', text: 'Pizza', votes: 8 },
          { id: '2', text: 'Sushi', votes: 6 },
          { id: '3', text: 'Burger', votes: 5 },
          { id: '4', text: 'Salad', votes: 4 }
        ],
        totalVotes: 23,
        createdAt: '2024-01-13',
        isActive: false,
        category: 'Team',
        author: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    ]

    return NextResponse.json({ polls: mockPolls })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, description, options, category } = body

    // Validation
    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      )
    }

    // For now, return a mock response
    const newPoll = {
      id: Date.now().toString(),
      question,
      description: description || '',
      options: options.map((option: string, index: number) => ({
        id: (index + 1).toString(),
        text: option,
        votes: 0
      })),
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
      category: category || 'General',
      author: {
        id: '1',
        name: 'Current User',
        email: 'user@example.com'
      }
    }

    return NextResponse.json({ poll: newPoll }, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
