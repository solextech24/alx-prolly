import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for server-side operations
let supabase: any = null

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
} catch (error) {
  console.warn('Supabase not configured, using mock data')
}

// Mock poll data for when Supabase is not configured
const getMockPoll = (id: string) => {
  const mockPolls = [
    {
      id: 'poll-1',
      question: 'What is your favorite programming language?',
      description: 'Choose your preferred programming language for web development',
      category: 'Technology',
      isActive: true,
      expiresAt: null,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      totalVotes: 156,
      options: [
        { id: 'option-1', text: 'JavaScript', votes: 45, percentage: 28.8 },
        { id: 'option-2', text: 'Python', votes: 38, percentage: 24.4 },
        { id: 'option-3', text: 'TypeScript', votes: 42, percentage: 26.9 },
        { id: 'option-4', text: 'Go', votes: 13, percentage: 8.3 },
        { id: 'option-5', text: 'Rust', votes: 18, percentage: 11.5 }
      ],
      author: {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: null
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
      updatedAt: '2024-01-14T10:30:00Z',
      totalVotes: 89,
      options: [
        { id: 'option-5', text: '9:00 AM', votes: 25, percentage: 28.1 },
        { id: 'option-6', text: '2:00 PM', votes: 34, percentage: 38.2 },
        { id: 'option-7', text: '4:00 PM', votes: 30, percentage: 33.7 }
      ],
      author: {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: null
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
      updatedAt: '2024-01-13T10:30:00Z',
      totalVotes: 67,
      options: [
        { id: 'option-8', text: 'Trello', votes: 15, percentage: 22.4 },
        { id: 'option-9', text: 'Asana', votes: 12, percentage: 17.9 },
        { id: 'option-10', text: 'Notion', votes: 25, percentage: 37.3 },
        { id: 'option-11', text: 'Linear', votes: 15, percentage: 22.4 }
      ],
      author: {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: null
      }
    }
  ]
  
  return mockPolls.find(poll => poll.id === id)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const pollId = resolvedParams.id

    // If Supabase is not configured, return mock data
    if (!supabase) {
      const mockPoll = getMockPoll(pollId)
      if (!mockPoll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
      }
      return NextResponse.json({ poll: mockPoll })
    }

    // Fetch poll with options and votes from Supabase
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        description,
        category,
        isActive,
        expiresAt,
        createdAt,
        updatedAt,
        authorId,
        users!polls_authorId_fkey (
          id,
          name,
          email,
          avatar
        ),
        poll_options (
          id,
          text,
          votes (
            id,
            userId
          )
        )
      `)
      .eq('id', pollId)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      // Try to fallback to mock data
      const mockPoll = getMockPoll(pollId)
      if (mockPoll) {
        return NextResponse.json({ poll: mockPoll })
      }
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Calculate vote counts and percentages
    const totalVotes = poll.poll_options.reduce((sum: number, option: any) => {
      return sum + (option.votes?.length || 0)
    }, 0)

    const pollWithStats = {
      id: poll.id,
      question: poll.question,
      description: poll.description,
      category: poll.category,
      isActive: poll.isActive,
      expiresAt: poll.expiresAt,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      totalVotes,
      options: poll.poll_options.map((option: any) => {
        const votes = option.votes?.length || 0
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
        
        return {
          id: option.id,
          text: option.text,
          votes,
          percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
        }
      }),
      author: {
        id: poll.users[0]?.id || poll.authorId,
        name: poll.users[0]?.name || 'Unknown',
        email: poll.users[0]?.email || 'unknown@example.com',
        avatar: poll.users[0]?.avatar || null
      }
    }

    return NextResponse.json({ poll: pollWithStats })
  } catch (error) {
    console.error('Error fetching poll:', error)
    // Try to fallback to mock data
    const resolvedParams = await params
    const mockPoll = getMockPoll(resolvedParams.id)
    if (mockPoll) {
      return NextResponse.json({ poll: mockPoll })
    }
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

    // If Supabase is not configured, return mock response
    if (!supabase) {
      const mockPoll = getMockPoll(pollId)
      if (!mockPoll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
      }
      
      const mockVote = {
        id: `vote-${Date.now()}`,
        pollId,
        optionId,
        userId,
        createdAt: new Date().toISOString()
      }
      
      return NextResponse.json({ 
        vote: mockVote,
        message: 'Vote created successfully (demo mode)' 
      }, { status: 201 })
    }

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, isActive, expiresAt')
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (!poll.isActive) {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    // Check if option exists
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('pollId', pollId)
      .single()

    if (optionError || !option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 })
    }

    // Check if user already voted on this poll
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('pollId', pollId)
      .eq('userId', userId)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Error checking existing vote:', voteCheckError)
      return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
    }

    if (existingVote) {
      // Update existing vote
      const { data: updatedVote, error: updateError } = await supabase
        .from('votes')
        .update({ optionId })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating vote:', updateError)
        return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
      }

      return NextResponse.json({ 
        vote: updatedVote,
        message: 'Vote updated successfully' 
      }, { status: 200 })
    } else {
      // Create new vote
      const { data: newVote, error: createError } = await supabase
        .from('votes')
        .insert({
          pollId,
          optionId,
          userId
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating vote:', createError)
        return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 })
      }

      return NextResponse.json({ 
        vote: newVote,
        message: 'Vote created successfully' 
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error voting on poll:', error)
    return NextResponse.json(
      { error: 'Failed to vote on poll' },
      { status: 500 }
    )
  }
}
