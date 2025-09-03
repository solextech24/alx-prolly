import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPoll, getPolls, getPollById } from '@/lib/actions/poll-actions'

// Initialize Supabase client with service role for server-side operations
let supabase: any = null
let isSupabaseConfigured = false

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    isSupabaseConfigured = true
  } else {
    console.warn('Supabase not configured, using mock data from poll actions')
  }
} catch (error) {
  console.warn('Supabase not configured, using mock data from poll actions')
}

// Mock data for when Supabase is not configured
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
      { id: 'option-4', text: 'Go', votes: 13 }
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
    // If Supabase is not configured, use our poll actions
    if (!supabase) {
      const polls = await getPolls()
      return NextResponse.json({ polls })
    }

    // Fetch polls with their options and vote counts from Supabase
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        description,
        category,
        isActive,
        expiresAt,
        createdAt,
        authorId,
        users!polls_authorId_fkey (
          id,
          name,
          email
        ),
        poll_options (
          id,
          text,
          votes (count)
        )
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    if (pollsError) {
      console.error('Error fetching polls:', pollsError)
      // Fallback to mock data on error
      return NextResponse.json({ polls: mockPolls })
    }

    // Transform the data to match the expected format
    const transformedPolls = polls?.map((poll: any) => {
      const totalVotes = poll.poll_options.reduce((sum: number, option: any) => {
        return sum + (option.votes?.length || 0)
      }, 0)

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        category: poll.category,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        totalVotes,
        options: poll.poll_options.map((option: any) => ({
          id: option.id,
          text: option.text,
          votes: option.votes?.length || 0
        })),
        author: {
          id: poll.users[0]?.id || poll.authorId,
          name: poll.users[0]?.name || 'Unknown',
          email: poll.users[0]?.email || 'unknown@example.com'
        }
      }
    }) || []

    return NextResponse.json({ polls: transformedPolls })
  } catch (error) {
    console.error('Error in GET /api/polls:', error)
    // Fallback to mock data on any error
    return NextResponse.json({ polls: mockPolls })
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

    // If Supabase is not configured, use our poll actions
    if (!supabase) {
      try {
        const pollData = {
          question: question.trim(),
          description: description?.trim() || '',
          options: options.map((opt: string) => opt.trim()),
          category: category || 'General'
        }
        
        // For demo purposes, we'll use a hardcoded user ID
        const demoUserId = 'user-1'
        
        const poll = await createPoll(pollData, demoUserId)
        
        if (!poll) {
          return NextResponse.json(
            { error: 'Failed to create poll' },
            { status: 400 }
          )
        }

        return NextResponse.json({ poll }, { status: 201 })
      } catch (error) {
        console.error('Error creating poll with mock actions:', error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500 }
        )
      }
    }

    // For demo purposes, we'll use a hardcoded user ID
    // In a real app, this would come from authentication
    const demoUserId = 'user-1' // This matches our sample data

    // Create the poll with Supabase
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        description: description?.trim() || null,
        category: category || 'General',
        authorId: demoUserId,
        isActive: true
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    // Create poll options
    const pollOptions = options.map((text: string) => ({
      text: text.trim(),
      pollId: poll.id
    }))

    const { data: createdOptions, error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions)
      .select()

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      // If options creation fails, clean up the poll
      await supabase.from('polls').delete().eq('id', poll.id)
      return NextResponse.json(
        { error: 'Failed to create poll options' },
        { status: 500 }
      )
    }

    // Return the created poll with options
    const pollWithOptions = {
      ...poll,
      options: createdOptions.map(option => ({
        id: option.id,
        text: option.text,
        votes: 0
      })),
      totalVotes: 0
    }

    return NextResponse.json(
      { 
        poll: pollWithOptions,
        message: 'Poll created successfully' 
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
