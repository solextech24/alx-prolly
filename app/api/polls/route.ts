import { NextRequest, NextResponse } from 'next/server'

// Mock polls data
const mockPolls = [
  {
    id: 'poll-1',
    question: 'What is your favorite programming language?',
    description: 'Choose your preferred programming language for web development',
    category: 'Technology',
    isActive: true,
    expiresAt: null,
    createdAt: '2024-01-15T10:30:00Z',
    totalVotes: 156,
    options: [
      { id: 'option-1', text: 'JavaScript', votes: 45 },
      { id: 'option-2', text: 'Python', votes: 38 },
      { id: 'option-3', text: 'TypeScript', votes: 42 },
      { id: 'option-4', text: 'Go', votes: 13 },
      { id: 'option-5', text: 'Rust', votes: 18 }
    ],
    author: {
      id: 'user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com'
    }
  },
  {
    id: 'poll-2',
    question: 'Best time for team meetings?',
    description: 'Help us decide the optimal time for our weekly team meetings',
    category: 'Work',
    isActive: true,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-14T10:30:00Z',
    totalVotes: 89,
    options: [
      { id: 'option-5', text: '9:00 AM', votes: 25 },
      { id: 'option-6', text: '2:00 PM', votes: 34 },
      { id: 'option-7', text: '4:00 PM', votes: 30 }
    ],
    author: {
      id: 'user-2',
      name: 'Bob Smith',
      email: 'bob@example.com'
    }
  },
  {
    id: 'poll-3',
    question: 'Preferred project management tool?',
    description: 'Vote for the tool you think would work best for our team',
    category: 'Productivity',
    isActive: true,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-13T10:30:00Z',
    totalVotes: 67,
    options: [
      { id: 'option-8', text: 'Trello', votes: 15 },
      { id: 'option-9', text: 'Asana', votes: 12 },
      { id: 'option-10', text: 'Notion', votes: 25 },
      { id: 'option-11', text: 'Linear', votes: 15 }
    ],
    author: {
      id: 'user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com'
    }
  }
]

export async function GET() {
  try {
    return NextResponse.json({ polls: mockPolls })
  } catch (error) {
    console.error('Error in GET /api/polls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Create new poll
    const newPoll = {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      description: description?.trim() || null,
      category: category || 'General',
      isActive: true,
      expiresAt: null,
      createdAt: new Date().toISOString(),
      totalVotes: 0,
      options: options.map((text: string, index: number) => ({
        id: `option-${Date.now()}-${index}`,
        text: text.trim(),
        votes: 0
      })),
      author: {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com'
      }
    }

    return NextResponse.json(
      { 
        poll: newPoll,
        message: 'Poll created successfully (demo mode)' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/polls:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
