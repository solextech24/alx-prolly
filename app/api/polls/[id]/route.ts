import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const pollId = resolvedParams.id

    // Mock poll data - in a real app, this would fetch from database
    const mockPoll = {
      id: pollId,
      question: 'What is your favorite programming language?',
      description: 'Choose the language you enjoy working with the most',
      options: [
        { id: '1', text: 'JavaScript', votes: 45, percentage: 28.8 },
        { id: '2', text: 'Python', votes: 38, percentage: 24.4 },
        { id: '3', text: 'TypeScript', votes: 42, percentage: 26.9 },
        { id: '4', text: 'Rust', votes: 18, percentage: 11.5 },
        { id: '5', text: 'Go', votes: 13, percentage: 8.3 }
      ],
      totalVotes: 156,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T15:45:00Z',
      expiresAt: null,
      isActive: true,
      category: 'Technology',
      author: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null
      }
    }

    return NextResponse.json({ poll: mockPoll })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const pollId = resolvedParams.id
    const body = await request.json()
    const { optionId, userId } = body

    // Validation
    if (!optionId || !userId) {
      return NextResponse.json(
        { error: 'Option ID and User ID are required' },
        { status: 400 }
      )
    }

    // Mock vote response
    const voteResult = {
      id: Date.now().toString(),
      pollId,
      optionId,
      userId,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ vote: voteResult }, { status: 201 })
  } catch (error) {
    console.error('Error voting on poll:', error)
    return NextResponse.json(
      { error: 'Failed to vote on poll' },
      { status: 500 }
    )
  }
}
